using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Dealership
{
    public class InviteWorkerRequest
    {
        [Required]
        public Guid UserId { get; set; } // User to invite

        [Required]
        public string Role { get; set; } = "Worker"; // "Worker" or "Admin"
    }
}

