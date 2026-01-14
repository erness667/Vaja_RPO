using System.Security.Claims;
using Backend.DTOs.Comment;
using Backend.Helpers;
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

            // Get current user ID if authenticated
            Guid? currentUserId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            var commentIds = await _dbContext.Comments
                .Where(c => c.CarId == carId)
                .Select(c => c.Id)
                .ToListAsync();

            // Get ratings for all comments
            var ratings = await _dbContext.CommentRatings
                .Where(cr => commentIds.Contains(cr.CommentId))
                .GroupBy(cr => cr.CommentId)
                .Select(g => new
                {
                    CommentId = g.Key,
                    AverageRating = g.Average(r => (double)r.Rating),
                    RatingCount = g.Count(),
                    UserRating = currentUserId.HasValue
                        ? g.Where(r => r.UserId == currentUserId.Value).Select(r => (int?)r.Rating).FirstOrDefault()
                        : null
                })
                .ToListAsync();

            var ratingsDict = ratings.ToDictionary(r => r.CommentId);

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
                    },
                    AverageRating = ratingsDict.ContainsKey(c.Id) ? ratingsDict[c.Id].AverageRating : null,
                    RatingCount = ratingsDict.ContainsKey(c.Id) ? ratingsDict[c.Id].RatingCount : 0,
                    UserRating = ratingsDict.ContainsKey(c.Id) ? ratingsDict[c.Id].UserRating : null
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
                },
                AverageRating = null,
                RatingCount = 0,
                UserRating = null
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

            // Check if the user is the owner of the comment or an admin
            if (!AuthorizationHelper.IsAdminOrOwner(User, comment.UserId))
            {
                return Forbid();
            }

            comment.Content = request.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            // Get rating info for the updated comment
            var ratingInfo = await _dbContext.CommentRatings
                .Where(cr => cr.CommentId == comment.Id)
                .GroupBy(cr => cr.CommentId)
                .Select(g => new
                {
                    AverageRating = g.Average(r => (double)r.Rating),
                    RatingCount = g.Count(),
                    UserRating = g.Where(r => r.UserId == userId).Select(r => (int?)r.Rating).FirstOrDefault()
                })
                .FirstOrDefaultAsync();

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
                },
                AverageRating = ratingInfo?.AverageRating,
                RatingCount = ratingInfo?.RatingCount ?? 0,
                UserRating = ratingInfo?.UserRating
            };

            return Ok(commentDto);
        }

        /// <summary>
        /// Rate a comment (requires authentication)
        /// </summary>
        [HttpPost("comments/{id}/rate")]
        [Authorize]
        public async Task<IActionResult> RateComment(int id, [FromBody] RateCommentRequest request)
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

            // Verify comment exists
            var comment = await _dbContext.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound(new { message = "Komentar ni bil najden." });
            }

            // Prevent users from rating their own comments
            if (comment.UserId == userId)
            {
                return BadRequest(new { message = "Ne morete oceniti svojega komentarja." });
            }

            // Check if user already rated this comment
            var existingRating = await _dbContext.CommentRatings
                .FirstOrDefaultAsync(cr => cr.CommentId == id && cr.UserId == userId);

            if (existingRating != null)
            {
                // Update existing rating
                existingRating.Rating = request.Rating;
                existingRating.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Create new rating
                var rating = new CommentRating
                {
                    CommentId = id,
                    UserId = userId,
                    Rating = request.Rating,
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.CommentRatings.Add(rating);
            }

            await _dbContext.SaveChangesAsync();

            // Get updated rating info
            var ratingInfo = await _dbContext.CommentRatings
                .Where(cr => cr.CommentId == id)
                .GroupBy(cr => cr.CommentId)
                .Select(g => new
                {
                    AverageRating = g.Average(r => (double)r.Rating),
                    RatingCount = g.Count(),
                    UserRating = g.Where(r => r.UserId == userId).Select(r => (int?)r.Rating).FirstOrDefault()
                })
                .FirstOrDefaultAsync();

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
                },
                AverageRating = ratingInfo?.AverageRating,
                RatingCount = ratingInfo?.RatingCount ?? 0,
                UserRating = ratingInfo?.UserRating
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

            // Check if the user is the owner of the comment or an admin
            if (!AuthorizationHelper.IsAdminOrOwner(User, comment.UserId))
            {
                return Forbid();
            }

            _dbContext.Comments.Remove(comment);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}

