using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
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

        /// <summary>
        /// Checks if the current user can manage a dealership car (admin, dealership owner, or dealership admin)
        /// </summary>
        public static async Task<bool> CanManageDealershipCarAsync(
            ClaimsPrincipal user, 
            ApplicationDbContext dbContext, 
            int? dealershipId, 
            Guid carSellerId)
        {
            // If no dealership, check if user is admin or owner
            if (!dealershipId.HasValue)
            {
                return IsAdminOrOwner(user, carSellerId);
            }

            // If admin, allow
            if (IsAdmin(user))
            {
                return true;
            }

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return false;
            }

            // Check if user is the car seller (original poster)
            if (userId == carSellerId)
            {
                return true;
            }

            // Check if user is owner of the dealership
            var dealership = await dbContext.CarDealerships
                .FirstOrDefaultAsync(d => d.Id == dealershipId.Value);

            if (dealership == null)
            {
                return false;
            }

            if (dealership.OwnerId == userId)
            {
                return true;
            }

            // Check if user is an active admin of the dealership
            var worker = await dbContext.DealershipWorkers
                .FirstOrDefaultAsync(w => 
                    w.DealershipId == dealershipId.Value && 
                    w.UserId == userId && 
                    w.Status == DealershipWorkerStatus.Active &&
                    w.Role == DealershipWorkerRole.Admin);

            return worker != null;
        }
    }
}

