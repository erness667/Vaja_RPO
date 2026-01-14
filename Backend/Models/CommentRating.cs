using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuperCarsApi.Models
{
    public class CommentRating
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Relationship to the comment being rated
        [Required]
        public int CommentId { get; set; }
        public Comment Comment { get; set; } = null!;

        // Relationship to the user who gave the rating
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Rating value (1-5 stars)
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        // Timestamp
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
