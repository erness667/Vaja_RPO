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

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(256)]
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(500)]
        [Url]
        public string? Website { get; set; }
    }
}

