using System.Security.Claims;
using SuperCarsApi.Models;

namespace Backend.Helpers
{
    public static class AuthorizationHelper
    {
        /// <summary>
        /// Checks if the current user is an admin based on their role claim
        /// </summary>
        public static bool IsAdmin(ClaimsPrincipal user)
        {
            var roleClaim = user.FindFirst(ClaimTypes.Role);
            return roleClaim != null && roleClaim.Value == Role.Admin.ToString();
        }

        /// <summary>
        /// Checks if the current user is an admin or the owner of a resource
        /// </summary>
        public static bool IsAdminOrOwner(ClaimsPrincipal user, Guid resourceOwnerId)
        {
            if (IsAdmin(user))
            {
                return true;
            }

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return false;
            }

            return userId == resourceOwnerId;
        }
    }
}

