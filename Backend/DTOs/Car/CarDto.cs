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
        public decimal? OriginalPrice { get; set; }
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

        /// <summary>
        /// Image information with IDs for management purposes.
        /// </summary>
        public List<CarImageInfo> Images { get; set; } = new();

        /// <summary>
        /// Number of times this car detail page was viewed.
        /// </summary>
        public int ViewCount { get; set; }

        /// <summary>
        /// Seller information (only included in detail view).
        /// </summary>
        public SellerInfo? Seller { get; set; }

        /// <summary>
        /// Dealership ID if this car is posted by a dealership (nullable).
        /// </summary>
        public int? DealershipId { get; set; }

        /// <summary>
        /// Dealership information if this car is posted by a dealership (nullable).
        /// </summary>
        public DealershipInfo? Dealership { get; set; }
    }

    public class SellerInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? AvatarImageUrl { get; set; }
    }

    public class CarImageInfo
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; }
    }

    public class DealershipInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PhoneNumber { get; set; }
    }
}

