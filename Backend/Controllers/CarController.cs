using System.Security.Claims;
using Backend.DTOs.Car;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/cars")]
    public class CarController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly CarDataService _carDataService;

        public CarController(ApplicationDbContext dbContext, CarDataService carDataService)
        {
            _dbContext = dbContext;
            _carDataService = carDataService;
        }

        /// <summary>
        /// Create a new car listing (requires authentication)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateCar([FromBody] CreateCarRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Get the current user ID from JWT claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                // Verify user exists
                var userExists = await _dbContext.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                // Get make and model names from IDs
                var make = _carDataService.GetMakeById(request.MakeId);
                var model = _carDataService.GetModelById(request.MakeId, request.ModelId);

                if (make == null || model == null)
                {
                    return BadRequest(new { message = "Invalid make or model ID." });
                }

                // Create the car
                var car = new Car
                {
                    SellerId = userId,
                    Brand = make.Name ?? string.Empty,
                    Model = model.Name ?? string.Empty,
                    Year = request.Year,
                    FirstRegistrationDate = request.FirstRegistrationDate,
                    Mileage = request.Mileage,
                    PreviousOwners = request.PreviousOwners,
                    FuelType = request.FuelType,
                    EnginePower = request.EnginePower,
                    Transmission = request.Transmission,
                    Color = request.Color,
                    EquipmentAndDetails = request.EquipmentAndDetails,
                    Price = request.Price,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _dbContext.Cars.Add(car);
                await _dbContext.SaveChangesAsync();

                // Return the created car as DTO
                var carDto = new CarDto
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
                    CreatedAt = car.CreatedAt,
                    UpdatedAt = car.UpdatedAt
                };

                return CreatedAtAction(nameof(GetCar), new { id = car.Id }, carDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create car listing", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a car by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCar(int id)
        {
            try
            {
                var car = await _dbContext.Cars
                    .Include(c => c.Seller)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (car == null)
                {
                    return NotFound(new { message = "Car not found." });
                }

                var carDto = new CarDto
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
                    CreatedAt = car.CreatedAt,
                    UpdatedAt = car.UpdatedAt
                };

                return Ok(carDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch car", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all cars (for listing on homepage)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCars(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? makeId = null,
            [FromQuery] string? modelId = null,
            [FromQuery] int? yearFrom = null,
            [FromQuery] int? yearTo = null,
            [FromQuery] decimal? priceFrom = null,
            [FromQuery] decimal? priceTo = null,
            [FromQuery] int? mileageTo = null,
            [FromQuery] string? fuelType = null)
        {
            try
            {
                var query = _dbContext.Cars.AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(makeId))
                {
                    var make = _carDataService.GetMakeById(makeId);
                    if (make != null && !string.IsNullOrEmpty(make.Name))
                    {
                        query = query.Where(c => c.Brand == make.Name);
                    }
                }

                if (!string.IsNullOrEmpty(modelId) && !string.IsNullOrEmpty(makeId))
                {
                    var model = _carDataService.GetModelById(makeId, modelId);
                    if (model != null && !string.IsNullOrEmpty(model.Name))
                    {
                        query = query.Where(c => c.Model == model.Name);
                    }
                }

                if (yearFrom.HasValue)
                {
                    query = query.Where(c => c.Year >= yearFrom.Value);
                }

                if (yearTo.HasValue)
                {
                    query = query.Where(c => c.Year <= yearTo.Value);
                }

                if (priceFrom.HasValue)
                {
                    query = query.Where(c => c.Price >= priceFrom.Value);
                }

                if (priceTo.HasValue)
                {
                    query = query.Where(c => c.Price <= priceTo.Value);
                }

                if (mileageTo.HasValue)
                {
                    query = query.Where(c => c.Mileage <= mileageTo.Value);
                }

                if (!string.IsNullOrEmpty(fuelType))
                {
                    query = query.Where(c => c.FuelType == fuelType);
                }

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply pagination
                var cars = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CarDto
                    {
                        Id = c.Id,
                        SellerId = c.SellerId,
                        Brand = c.Brand,
                        Model = c.Model,
                        Year = c.Year,
                        FirstRegistrationDate = c.FirstRegistrationDate,
                        Mileage = c.Mileage,
                        PreviousOwners = c.PreviousOwners,
                        FuelType = c.FuelType,
                        EnginePower = c.EnginePower,
                        Transmission = c.Transmission,
                        Color = c.Color,
                        EquipmentAndDetails = c.EquipmentAndDetails,
                        Price = c.Price,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    cars,
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch cars", error = ex.Message });
            }
        }
    }
}

