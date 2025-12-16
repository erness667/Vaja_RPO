using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class Favourite
    {
        public int Id { get; set; }

        // Relationship to the user who favourited the car
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Relationship to the favourited car
        [Required]
        public int CarId { get; set; }
        public Car Car { get; set; } = null!;

        // Timestamp when the car was added to favourites
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

