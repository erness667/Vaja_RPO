using System.Security.Claims;
using Backend.DTOs.Car;
using Backend.DTOs.ViewHistory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/view-history")]
    [Authorize]
    public class ViewHistoryController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ViewHistoryController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Returns the last 10 cars the authenticated user opened (most recent first).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetHistory()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var items = await _dbContext.ViewHistories
                .Where(vh => vh.UserId == userId)
                .OrderByDescending(vh => vh.ViewedAt)
                .Take(10)
                .Include(vh => vh.Car)!.ThenInclude(c => c.Images)
                .Include(vh => vh.Car)!.ThenInclude(c => c.Seller)
                .ToListAsync();

            var dtos = items.Select(vh =>
            {
                CarDto? carDto = null;
                if (vh.Car != null)
                {
                    var mainImage = vh.Car.Images?.FirstOrDefault(i => i.IsMain)
                                    ?? vh.Car.Images?.FirstOrDefault();

                    carDto = new CarDto
                    {
                        Id = vh.Car.Id,
                        SellerId = vh.Car.SellerId,
                        Brand = vh.Car.Brand,
                        Model = vh.Car.Model,
                        Year = vh.Car.Year,
                        FirstRegistrationDate = vh.Car.FirstRegistrationDate,
                        Mileage = vh.Car.Mileage,
                        PreviousOwners = vh.Car.PreviousOwners,
                        FuelType = vh.Car.FuelType,
                        EnginePower = vh.Car.EnginePower,
                        Transmission = vh.Car.Transmission,
                        Color = vh.Car.Color,
                        EquipmentAndDetails = vh.Car.EquipmentAndDetails,
                        Price = vh.Car.Price,
                        OriginalPrice = vh.Car.OriginalPrice,
                        CreatedAt = vh.Car.CreatedAt,
                        UpdatedAt = vh.Car.UpdatedAt,
                        MainImageUrl = mainImage?.Url,
                        ImageUrls = vh.Car.Images?.Select(i => i.Url).ToList() ?? new List<string>(),
                        ViewCount = vh.Car.ViewCount,
                        Seller = vh.Car.Seller == null ? null : new SellerInfo
                        {
                            Name = vh.Car.Seller.Name,
                            Surname = vh.Car.Seller.Surname,
                            PhoneNumber = vh.Car.Seller.PhoneNumber,
                            AvatarImageUrl = vh.Car.Seller.AvatarImageUrl
                        }
                    };
                }

                return new ViewHistoryDto
                {
                    Id = vh.Id,
                    CarId = vh.CarId,
                    ViewedAt = vh.ViewedAt,
                    Car = carDto
                };
            });

            return Ok(dtos);
        }
    }
}

