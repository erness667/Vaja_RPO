using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class Comment
    {
        public int Id { get; set; }

        // Relationship to the car
        [Required]
        public int CarId { get; set; }
        public Car Car { get; set; } = null!;

        // Relationship to the user who wrote the comment
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Comment content
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}

