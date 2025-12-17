using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SuperCarsApi.Models
{
    public class ViewHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public int CarId { get; set; }

        [Required]
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public Car? Car { get; set; }
    }
}

