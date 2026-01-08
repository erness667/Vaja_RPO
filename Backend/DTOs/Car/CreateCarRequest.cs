using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Car
{
    public class CreateCarRequest
    {
        [Required]
        public string MakeId { get; set; } = string.Empty;

        [Required]
        public string ModelId { get; set; } = string.Empty;

        [Required]
        [Range(1900, 2100, ErrorMessage = "Year must be between 1900 and 2100")]
        public int Year { get; set; }

        [Required]
        public DateTime FirstRegistrationDate { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Mileage must be greater than or equal to 0")]
        public int Mileage { get; set; }

        [Required]
        [Range(0, 20, ErrorMessage = "Previous owners must be between 0 and 20")]
        public int PreviousOwners { get; set; }

        [Required]
        [MaxLength(50)]
        public string FuelType { get; set; } = string.Empty;

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Engine power must be greater than or equal to 0")]
        public int EnginePower { get; set; }

        [Required]
        [MaxLength(50)]
        public string Transmission { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Color { get; set; } = string.Empty;

        public string? EquipmentAndDetails { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0")]
        public decimal Price { get; set; }

        // Optional dealership ID if posting as a dealership
        public int? DealershipId { get; set; }
    }
}

