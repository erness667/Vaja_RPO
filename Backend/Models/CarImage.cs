using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class CarImage
    {
        public int Id { get; set; }

        [Required]
        public int CarId { get; set; }

        public Car Car { get; set; } = null!;

        [Required]
        [MaxLength(2048)]
        public string Url { get; set; } = string.Empty;

        /// <summary>
        /// Indicates whether this image is the main/primary image for the car.
        /// </summary>
        public bool IsMain { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}


