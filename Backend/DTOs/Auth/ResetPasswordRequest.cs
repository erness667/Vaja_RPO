using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Auth
{
    public class ResetPasswordRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required, MinLength(6), MaxLength(128)]
        public string NewPassword { get; set; } = string.Empty;
    }
}

