using System.Security.Claims;
using Backend.DTOs.Auth;
using Backend.DTOs.User;
using Backend.Helpers;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/user")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public UserController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                PhoneNumber = user.PhoneNumber,
                AvatarImageUrl = user.AvatarImageUrl,
                Role = user.Role
            };

            return Ok(userDto);
        }

        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Verify current password
            var isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!isCurrentPasswordValid)
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.Name = request.Name.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Surname))
            {
                user.Surname = request.Surname.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                user.PhoneNumber = request.PhoneNumber.Trim();
            }

            await _dbContext.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                PhoneNumber = user.PhoneNumber,
                AvatarImageUrl = user.AvatarImageUrl,
                Role = user.Role
            };

            return Ok(userDto);
        }

        [HttpPut("avatar")]
        public async Task<IActionResult> UpdateAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new { message = "Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP." });
            }

            // Validate file size (max 5MB)
            const long maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = "File size exceeds 5MB limit." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            var uniqueFileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Delete old avatar if it exists and is in our uploads folder
            if (!string.IsNullOrEmpty(user.AvatarImageUrl))
            {
                var oldFileName = Path.GetFileName(user.AvatarImageUrl);
                if (!string.IsNullOrEmpty(oldFileName))
                {
                    var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                        catch
                        {
                            // Ignore errors when deleting old file
                        }
                    }
                }
            }

            // Save the new file
            using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update avatar image URL (relative path that will be served by static files)
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            user.AvatarImageUrl = $"{baseUrl}/uploads/avatars/{uniqueFileName}";
            await _dbContext.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                PhoneNumber = user.PhoneNumber,
                AvatarImageUrl = user.AvatarImageUrl,
                Role = user.Role
            };

            return Ok(userDto);
        }

        // ========== ADMIN ENDPOINTS ==========

        /// <summary>
        /// Get all users (Admin only)
        /// </summary>
        [HttpGet("admin/users")]
        [Authorize]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null)
        {
            if (!AuthorizationHelper.IsAdmin(User))
            {
                return Forbid();
            }

            var query = _dbContext.Users.AsQueryable();

            // Search by name, surname, email, or username
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(searchLower) ||
                    u.Surname.ToLower().Contains(searchLower) ||
                    u.Email.ToLower().Contains(searchLower) ||
                    u.Username.ToLower().Contains(searchLower));
            }

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Name = u.Name,
                    Surname = u.Surname,
                    Username = u.Username,
                    PhoneNumber = u.PhoneNumber,
                    AvatarImageUrl = u.AvatarImageUrl,
                    Role = u.Role
                })
                .ToListAsync();

            return Ok(new
            {
                users,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        /// <summary>
        /// Get a specific user by ID (Admin only)
        /// </summary>
        [HttpGet("admin/users/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            if (!AuthorizationHelper.IsAdmin(User))
            {
                return Forbid();
            }

            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                PhoneNumber = user.PhoneNumber,
                AvatarImageUrl = user.AvatarImageUrl,
                Role = user.Role
            };

            return Ok(userDto);
        }

        /// <summary>
        /// Update a user's role (Admin only)
        /// </summary>
        [HttpPut("admin/users/{id}/role")]
        [Authorize]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
        {
            if (!AuthorizationHelper.IsAdmin(User))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!Enum.IsDefined(typeof(Role), request.Role))
            {
                return BadRequest(new { message = "Invalid role." });
            }

            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Prevent admin from removing their own admin role
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (currentUserIdClaim != null && Guid.TryParse(currentUserIdClaim.Value, out var currentUserId))
            {
                if (currentUserId == id && request.Role != Role.Admin)
                {
                    return BadRequest(new { message = "You cannot remove your own admin role." });
                }
            }

            user.Role = request.Role;
            await _dbContext.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                PhoneNumber = user.PhoneNumber,
                AvatarImageUrl = user.AvatarImageUrl,
                Role = user.Role
            };

            return Ok(userDto);
        }

        /// <summary>
        /// Delete a user (Admin only)
        /// </summary>
        [HttpDelete("admin/users/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            if (!AuthorizationHelper.IsAdmin(User))
            {
                return Forbid();
            }

            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Prevent admin from deleting themselves
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (currentUserIdClaim != null && Guid.TryParse(currentUserIdClaim.Value, out var currentUserId))
            {
                if (currentUserId == id)
                {
                    return BadRequest(new { message = "You cannot delete your own account." });
                }
            }

            _dbContext.Users.Remove(user);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Update any user's profile (Admin only)
        /// </summary>
        [HttpPut("admin/users/{id}/profile")]
        [Authorize]
        public async Task<IActionResult> UpdateUserProfile(Guid id, [FromBody] UpdateProfileRequest request)
        {
            if (!AuthorizationHelper.IsAdmin(User))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.Name = request.Name.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Surname))
            {
                user.Surname = request.Surname.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                user.PhoneNumber = request.PhoneNumber.Trim();
            }

            await _dbContext.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                PhoneNumber = user.PhoneNumber,
                AvatarImageUrl = user.AvatarImageUrl,
                Role = user.Role
            };

            return Ok(userDto);
        }
    }
}

