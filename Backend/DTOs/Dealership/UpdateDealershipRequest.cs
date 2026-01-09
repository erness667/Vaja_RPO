using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Dealership
{
    public class UpdateDealershipRequest
    {
        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? City { get; set; }

        // Geographic coordinates (optional, can be auto-filled from address)
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(256)]
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(500)]
        [Url]
        public string? Website { get; set; }

        [MaxLength(20)]
        public string? TaxNumber { get; set; }
    }
}

