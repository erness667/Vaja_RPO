using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.User
{
    public class UpdateProfileRequest
    {
        [MaxLength(128)]
        public string? Name { get; set; }

        [MaxLength(128)]
        public string? Surname { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
    }
}

