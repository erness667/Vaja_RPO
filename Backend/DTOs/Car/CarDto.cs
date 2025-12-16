namespace Backend.DTOs.Car
{
    public class CarDto
    {
        public int Id { get; set; }
        public Guid SellerId { get; set; }
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public DateTime FirstRegistrationDate { get; set; }
        public int Mileage { get; set; }
        public int PreviousOwners { get; set; }
        public string FuelType { get; set; } = string.Empty;
        public int EnginePower { get; set; }
        public string Transmission { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? EquipmentAndDetails { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// URL of the main/primary image for this car (if any).
        /// </summary>
        public string? MainImageUrl { get; set; }

        /// <summary>
        /// All image URLs associated with this car.
        /// </summary>
        public List<string> ImageUrls { get; set; } = new();
    }
}

