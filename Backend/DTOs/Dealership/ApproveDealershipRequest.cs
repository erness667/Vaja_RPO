using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Dealership
{
    public class ApproveDealershipRequest
    {
        [Required]
        public bool Approve { get; set; } // true to approve, false to decline

        [MaxLength(1000)]
        public string? Notes { get; set; } // Optional notes from admin
    }
}

