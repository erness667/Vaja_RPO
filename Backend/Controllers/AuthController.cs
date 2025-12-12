using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.DTOs.Auth;
using Backend.Options;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly JwtSettings _jwtSettings;

        public AuthController(ApplicationDbContext dbContext, IOptions<JwtSettings> jwtOptions)
        {
            _dbContext = dbContext;
            _jwtSettings = jwtOptions.Value;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var normalizedUsername = request.Username.Trim().ToLowerInvariant();

            var emailExists = await _dbContext.Users.AnyAsync(u => u.Email == normalizedEmail);
            if (emailExists)
            {
                return Conflict(new { message = "Email already registered." });
            }

            var usernameExists = await _dbContext.Users.AnyAsync(u => u.Username.ToLower() == normalizedUsername);
            if (usernameExists)
            {
                return Conflict(new { message = "Username already taken." });
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Surname = request.Surname.Trim(),
                Email = normalizedEmail,
                PhoneNumber = request.PhoneNumber.Trim(),
                Username = request.Username.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            var (accessToken, expiresAt) = GenerateJwtToken(user);
            var (refreshToken, refreshTokenExpiresAt) = await GenerateRefreshTokenAsync(user);

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                ExpiresAt = expiresAt,
                RefreshToken = refreshToken,
                RefreshTokenExpiresAt = refreshTokenExpiresAt,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Surname = user.Surname,
                    Username = user.Username,
                    PhoneNumber = user.PhoneNumber,
                    AvatarImageUrl = user.AvatarImageUrl
                }
            };

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var loginIdentifier = request.Username.Trim().ToLowerInvariant();

            // Try to find user by username or email
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => 
                    u.Username.ToLower() == loginIdentifier || 
                    u.Email.ToLower() == loginIdentifier);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // Verify password
            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // Generate JWT token
            var (accessToken, expiresAt) = GenerateJwtToken(user);
            var (refreshToken, refreshTokenExpiresAt) = await GenerateRefreshTokenAsync(user);

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                ExpiresAt = expiresAt,
                RefreshToken = refreshToken,
                RefreshTokenExpiresAt = refreshTokenExpiresAt,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Surname = user.Surname,
                    Username = user.Username,
                    PhoneNumber = user.PhoneNumber,
                    AvatarImageUrl = user.AvatarImageUrl
                }
            };

            return Ok(response);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            // Extract JTI (JWT ID) from the current token
            var jtiClaim = User.FindFirst(JwtRegisteredClaimNames.Jti);
            if (jtiClaim == null)
            {
                return BadRequest(new { message = "Invalid token." });
            }

            // Extract expiration time from token
            var expClaim = User.FindFirst(JwtRegisteredClaimNames.Exp);
            DateTime expiresAt;
            if (expClaim != null && long.TryParse(expClaim.Value, out var expUnix))
            {
                expiresAt = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
            }
            else
            {
                // Fallback: use current time + token lifetime
                expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes);
            }

            // Check if token is already blacklisted
            var alreadyBlacklisted = await _dbContext.BlacklistedTokens
                .AnyAsync(b => b.Jti == jtiClaim.Value);

            if (!alreadyBlacklisted)
            {
                // Add token to blacklist
                var blacklistedToken = new BlacklistedToken
                {
                    Id = Guid.NewGuid(),
                    Jti = jtiClaim.Value,
                    ExpiresAt = expiresAt,
                    BlacklistedAt = DateTime.UtcNow
                };

                await _dbContext.BlacklistedTokens.AddAsync(blacklistedToken);
            }

            // Revoke all refresh tokens for this user
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                var activeRefreshTokens = await _dbContext.RefreshTokens
                    .Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
                    .ToListAsync();

                foreach (var token in activeRefreshTokens)
                {
                    token.IsRevoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                }
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Successfully logged out." });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find the refresh token
            var refreshToken = await _dbContext.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

            if (refreshToken == null)
            {
                return Unauthorized(new { message = "Invalid refresh token." });
            }

            // Check if token is revoked
            if (refreshToken.IsRevoked)
            {
                return Unauthorized(new { message = "Refresh token has been revoked." });
            }

            // Check if token is expired
            if (refreshToken.ExpiresAt < DateTime.UtcNow)
            {
                return Unauthorized(new { message = "Refresh token has expired." });
            }

            // Generate new access token
            var (accessToken, expiresAt) = GenerateJwtToken(refreshToken.User);

            // Optionally rotate refresh token (revoke old, create new)
            refreshToken.IsRevoked = true;
            refreshToken.RevokedAt = DateTime.UtcNow;

            var (newRefreshToken, newRefreshTokenExpiresAt) = await GenerateRefreshTokenAsync(refreshToken.User);

            await _dbContext.SaveChangesAsync();

            var response = new AuthResponse
            {
                AccessToken = accessToken,
                ExpiresAt = expiresAt,
                RefreshToken = newRefreshToken,
                RefreshTokenExpiresAt = newRefreshTokenExpiresAt,
                User = new UserDto
                {
                    Id = refreshToken.User.Id,
                    Email = refreshToken.User.Email,
                    Name = refreshToken.User.Name,
                    Surname = refreshToken.User.Surname,
                    Username = refreshToken.User.Username,
                    PhoneNumber = refreshToken.User.PhoneNumber
                }
            };

            return Ok(response);
        }

        private (string token, DateTime expiresAt) GenerateJwtToken(User user)
        {
            var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            var encoded = new JwtSecurityTokenHandler().WriteToken(token);
            return (encoded, expires);
        }

        private async Task<(string token, DateTime expiresAt)> GenerateRefreshTokenAsync(User user)
        {
            var token = Guid.NewGuid().ToString();
            var expiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDays);

            var refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = token,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            await _dbContext.RefreshTokens.AddAsync(refreshToken);
            await _dbContext.SaveChangesAsync();

            return (token, expiresAt);
        }
    }
}

