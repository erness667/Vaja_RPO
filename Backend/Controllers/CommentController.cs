using System.Security.Claims;
using Backend.DTOs.Comment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api")]
    public class CommentController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public CommentController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Get all comments for a specific car
        /// </summary>
        [HttpGet("cars/{carId}/comments")]
        public async Task<IActionResult> GetCommentsByCar(int carId)
        {
            // Verify car exists
            var carExists = await _dbContext.Cars.AnyAsync(c => c.Id == carId);
            if (!carExists)
            {
                return NotFound(new { message = "Vozilo ni bilo najdeno." });
            }

            var comments = await _dbContext.Comments
                .Where(c => c.CarId == carId)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    CarId = c.CarId,
                    UserId = c.UserId,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    Author = new CommentAuthor
                    {
                        Name = c.User.Name,
                        Surname = c.User.Surname,
                        AvatarImageUrl = c.User.AvatarImageUrl
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }

        /// <summary>
        /// Create a new comment for a car (requires authentication)
        /// </summary>
        [HttpPost("cars/{carId}/comments")]
        [Authorize]
        public async Task<IActionResult> CreateComment(int carId, [FromBody] CreateCommentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verify car exists
            var carExists = await _dbContext.Cars.AnyAsync(c => c.Id == carId);
            if (!carExists)
            {
                return NotFound(new { message = "Vozilo ni bilo najdeno." });
            }

            // Get the current user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            // Verify user exists
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized(new { message = "Uporabnik ni bil najden." });
            }

            var comment = new Comment
            {
                CarId = carId,
                UserId = userId,
                Content = request.Content,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Comments.Add(comment);
            await _dbContext.SaveChangesAsync();

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                CarId = comment.CarId,
                UserId = comment.UserId,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                Author = new CommentAuthor
                {
                    Name = user.Name,
                    Surname = user.Surname,
                    AvatarImageUrl = user.AvatarImageUrl
                }
            };

            return CreatedAtAction(nameof(GetCommentsByCar), new { carId }, commentDto);
        }

        /// <summary>
        /// Update a comment (requires authentication, owner only)
        /// </summary>
        [HttpPut("comments/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get the current user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            var comment = await _dbContext.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound(new { message = "Komentar ni bil najden." });
            }

            // Check if the user is the owner of the comment
            if (comment.UserId != userId)
            {
                return Forbid();
            }

            comment.Content = request.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                CarId = comment.CarId,
                UserId = comment.UserId,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                Author = new CommentAuthor
                {
                    Name = comment.User.Name,
                    Surname = comment.User.Surname,
                    AvatarImageUrl = comment.User.AvatarImageUrl
                }
            };

            return Ok(commentDto);
        }

        /// <summary>
        /// Delete a comment (requires authentication, owner only)
        /// </summary>
        [HttpDelete("comments/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            // Get the current user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            var comment = await _dbContext.Comments.FindAsync(id);

            if (comment == null)
            {
                return NotFound(new { message = "Komentar ni bil najden." });
            }

            // Check if the user is the owner of the comment
            if (comment.UserId != userId)
            {
                return Forbid();
            }

            _dbContext.Comments.Remove(comment);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}

