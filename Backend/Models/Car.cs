using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class Car
    {
        public int Id { get; set; }

        // Relationship to the seller (registered user)
        [Required]
        public Guid SellerId { get; set; }
        public User Seller { get; set; } = null!;

        // Basic car information
        [Required, MaxLength(100)]
        public string Brand { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Model { get; set; } = string.Empty;

        [Required]
        public int Year { get; set; }

        // Prva registracija (First registration date)
        [Required]
        public DateTime FirstRegistrationDate { get; set; }

        // Prevoženih km (Mileage/Kilometers driven)
        [Required]
        public int Mileage { get; set; }

        // Predhodnih Lastnikov (Number of previous owners)
        [Required]
        public int PreviousOwners { get; set; }

        // Vrsta goriva (Fuel type)
        [Required, MaxLength(50)]
        public string FuelType { get; set; } = string.Empty; // e.g., "Benzin", "Diesel", "Električni", "Hibridni"

        // Moč motorja (Engine power in kW or HP)
        [Required]
        public int EnginePower { get; set; } // in kW or HP

        // Menjalnik (Transmission)
        [Required, MaxLength(50)]
        public string Transmission { get; set; } = string.Empty; // e.g., "Ročni", "Avtomatski", "DSG"

        // Barva (Color)
        [Required, MaxLength(50)]
        public string Color { get; set; } = string.Empty;

        // Oprema in ostali podatki o ponudbi (Equipment and other offer details - Rich text)
        public string? EquipmentAndDetails { get; set; } // Rich text area, nullable

        // Cena (Price)
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0")]
        public decimal Price { get; set; }

        // Number of times this car detail page was viewed
        public int ViewCount { get; set; } = 0;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property for comments
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();

        // Navigation property for car images
        public ICollection<CarImage> Images { get; set; } = new List<CarImage>();
    }
}