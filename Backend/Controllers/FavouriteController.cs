using System.Security.Claims;
using Backend.DTOs.Car;
using Backend.DTOs.Favourite;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/favourites")]
    [Authorize]
    public class FavouriteController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public FavouriteController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Get all favourites for the current user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyFavourites()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            var favourites = await _dbContext.Favourites
                .Where(f => f.UserId == userId)
                .Include(f => f.Car)
                    .ThenInclude(c => c.Images)
                .Include(f => f.Car)
                    .ThenInclude(c => c.Seller)
                .Include(f => f.Car)
                    .ThenInclude(c => c.Dealership)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FavouriteDto
                {
                    Id = f.Id,
                    CarId = f.CarId,
                    CreatedAt = f.CreatedAt,
                    Car = new CarDto
                    {
                        Id = f.Car.Id,
                        SellerId = f.Car.SellerId,
                        Brand = f.Car.Brand,
                        Model = f.Car.Model,
                        Year = f.Car.Year,
                        FirstRegistrationDate = f.Car.FirstRegistrationDate,
                        Mileage = f.Car.Mileage,
                        PreviousOwners = f.Car.PreviousOwners,
                        FuelType = f.Car.FuelType,
                        EnginePower = f.Car.EnginePower,
                        Transmission = f.Car.Transmission,
                        Color = f.Car.Color,
                        EquipmentAndDetails = f.Car.EquipmentAndDetails,
                        Price = f.Car.Price,
                        OriginalPrice = f.Car.OriginalPrice,
                    ViewCount = f.Car.ViewCount,
                        CreatedAt = f.Car.CreatedAt,
                        UpdatedAt = f.Car.UpdatedAt,
                        MainImageUrl = f.Car.Images
                            .Where(i => i.IsMain)
                            .Select(i => i.Url)
                            .FirstOrDefault() ?? f.Car.Images
                            .Select(i => i.Url)
                            .FirstOrDefault(),
                        ImageUrls = f.Car.Images
                            .OrderByDescending(i => i.IsMain)
                            .ThenBy(i => i.Id)
                            .Select(i => i.Url)
                            .ToList(),
                        // If car is posted by a dealership, populate SellerInfo with dealership info
                        // Otherwise, use the user's (seller's) info
                        Seller = f.Car.DealershipId.HasValue && f.Car.Dealership != null
                            ? new SellerInfo
                            {
                                Name = f.Car.Dealership.Name,
                                Surname = "", // Dealerships don't have surnames
                                PhoneNumber = f.Car.Dealership.PhoneNumber,
                                AvatarImageUrl = null // Dealerships don't have avatars
                            }
                            : (f.Car.Seller != null ? new SellerInfo
                            {
                                Name = f.Car.Seller.Name,
                                Surname = f.Car.Seller.Surname,
                                PhoneNumber = f.Car.Seller.PhoneNumber,
                                AvatarImageUrl = f.Car.Seller.AvatarImageUrl
                            } : null),
                        DealershipId = f.Car.DealershipId,
                        Dealership = f.Car.Dealership != null ? new DealershipInfo
                        {
                            Id = f.Car.Dealership.Id,
                            Name = f.Car.Dealership.Name,
                            Address = f.Car.Dealership.Address,
                            City = f.Car.Dealership.City,
                            PhoneNumber = f.Car.Dealership.PhoneNumber
                        } : null
                    }
                })
                .ToListAsync();

            return Ok(favourites);
        }

        /// <summary>
        /// Add a car to favourites
        /// </summary>
        [HttpPost("{carId}")]
        public async Task<IActionResult> AddToFavourites(int carId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            // Check if car exists
            var car = await _dbContext.Cars
                .Include(c => c.Images)
                .Include(c => c.Seller)
                .Include(c => c.Dealership)
                .FirstOrDefaultAsync(c => c.Id == carId);

            if (car == null)
            {
                return NotFound(new { message = "Vozilo ni bilo najdeno." });
            }

            // Check if already favourited
            var existingFavourite = await _dbContext.Favourites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == carId);

            if (existingFavourite != null)
            {
                return BadRequest(new { message = "Vozilo je že med priljubljenimi." });
            }

            var favourite = new Favourite
            {
                UserId = userId,
                CarId = carId,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Favourites.Add(favourite);
            await _dbContext.SaveChangesAsync();

            var favouriteDto = new FavouriteDto
            {
                Id = favourite.Id,
                CarId = favourite.CarId,
                CreatedAt = favourite.CreatedAt,
                Car = new CarDto
                {
                    Id = car.Id,
                    SellerId = car.SellerId,
                    Brand = car.Brand,
                    Model = car.Model,
                    Year = car.Year,
                    FirstRegistrationDate = car.FirstRegistrationDate,
                    Mileage = car.Mileage,
                    PreviousOwners = car.PreviousOwners,
                    FuelType = car.FuelType,
                    EnginePower = car.EnginePower,
                    Transmission = car.Transmission,
                    Color = car.Color,
                    EquipmentAndDetails = car.EquipmentAndDetails,
                    Price = car.Price,
                    OriginalPrice = car.OriginalPrice,
                    ViewCount = car.ViewCount,
                    CreatedAt = car.CreatedAt,
                    UpdatedAt = car.UpdatedAt,
                    MainImageUrl = car.Images
                        .Where(i => i.IsMain)
                        .Select(i => i.Url)
                        .FirstOrDefault() ?? car.Images
                        .Select(i => i.Url)
                        .FirstOrDefault(),
                    ImageUrls = car.Images
                        .OrderByDescending(i => i.IsMain)
                        .ThenBy(i => i.Id)
                        .Select(i => i.Url)
                        .ToList(),
                    // If car is posted by a dealership, populate SellerInfo with dealership info
                    // Otherwise, use the user's (seller's) info
                    Seller = car.DealershipId.HasValue && car.Dealership != null
                        ? new SellerInfo
                        {
                            Name = car.Dealership.Name,
                            Surname = "", // Dealerships don't have surnames
                            PhoneNumber = car.Dealership.PhoneNumber,
                            AvatarImageUrl = null // Dealerships don't have avatars
                        }
                        : (car.Seller != null ? new SellerInfo
                        {
                            Name = car.Seller.Name,
                            Surname = car.Seller.Surname,
                            PhoneNumber = car.Seller.PhoneNumber,
                            AvatarImageUrl = car.Seller.AvatarImageUrl
                        } : null),
                    DealershipId = car.DealershipId,
                    Dealership = car.Dealership != null ? new DealershipInfo
                    {
                        Id = car.Dealership.Id,
                        Name = car.Dealership.Name,
                        Address = car.Dealership.Address,
                        City = car.Dealership.City,
                        PhoneNumber = car.Dealership.PhoneNumber
                    } : null
                }
            };

            return CreatedAtAction(nameof(GetMyFavourites), favouriteDto);
        }

        /// <summary>
        /// Remove a car from favourites
        /// </summary>
        [HttpDelete("{carId}")]
        public async Task<IActionResult> RemoveFromFavourites(int carId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            var favourite = await _dbContext.Favourites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == carId);

            if (favourite == null)
            {
                return NotFound(new { message = "Vozilo ni med priljubljenimi." });
            }

            _dbContext.Favourites.Remove(favourite);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Check if a car is in the user's favourites
        /// </summary>
        [HttpGet("{carId}/check")]
        public async Task<IActionResult> CheckFavourite(int carId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            var isFavourite = await _dbContext.Favourites
                .AnyAsync(f => f.UserId == userId && f.CarId == carId);

            return Ok(new { isFavourite });
        }

        /// <summary>
        /// Toggle favourite status for a car (add if not exists, remove if exists)
        /// </summary>
        [HttpPost("{carId}/toggle")]
        public async Task<IActionResult> ToggleFavourite(int carId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Neveljavna seja." });
            }

            // Check if car exists
            var carExists = await _dbContext.Cars.AnyAsync(c => c.Id == carId);
            if (!carExists)
            {
                return NotFound(new { message = "Vozilo ni bilo najdeno." });
            }

            var existingFavourite = await _dbContext.Favourites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == carId);

            if (existingFavourite != null)
            {
                // Remove from favourites
                _dbContext.Favourites.Remove(existingFavourite);
                await _dbContext.SaveChangesAsync();
                return Ok(new { isFavourite = false, message = "Vozilo odstranjeno iz priljubljenih." });
            }
            else
            {
                // Add to favourites
                var favourite = new Favourite
                {
                    UserId = userId,
                    CarId = carId,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.Favourites.Add(favourite);
                await _dbContext.SaveChangesAsync();
                return Ok(new { isFavourite = true, message = "Vozilo dodano med priljubljene." });
            }
        }
    }
}

