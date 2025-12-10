using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required, MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

