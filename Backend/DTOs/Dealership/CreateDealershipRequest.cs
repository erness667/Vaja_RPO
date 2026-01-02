using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Dealership
{
    public class CreateDealershipRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(256)]
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(500)]
        [Url]
        public string? Website { get; set; }
    }
}

