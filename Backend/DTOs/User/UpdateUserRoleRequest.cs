using System.ComponentModel.DataAnnotations;
using SuperCarsApi.Models;

namespace Backend.DTOs.User
{
    public class UpdateUserRoleRequest
    {
        [Required]
        public Role Role { get; set; }
    }
}

