using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Dealership
{
    public class UpdateWorkerRoleRequest
    {
        [Required]
        public string Role { get; set; } = string.Empty; // "Worker" or "Admin"
    }
}

