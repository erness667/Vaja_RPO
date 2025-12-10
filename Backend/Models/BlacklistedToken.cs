using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class BlacklistedToken
    {
        public Guid Id { get; set; }

        [Required]
        public string Jti { get; set; } = string.Empty; // JWT ID claim

        public DateTime ExpiresAt { get; set; }

        public DateTime BlacklistedAt { get; set; } = DateTime.UtcNow;
    }
}

