using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required, MaxLength(128)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(128)]
        public string Surname { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(6), MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }
}

