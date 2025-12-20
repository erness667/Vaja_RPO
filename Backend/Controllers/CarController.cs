using System.Security.Claims;
using Backend.DTOs.Car;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
                    OriginalPrice = request.Price, // Set original price to initial price
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
                    OriginalPrice = car.OriginalPrice,
                    ViewCount = car.ViewCount,
                    CreatedAt = car.CreatedAt,
                    UpdatedAt = car.UpdatedAt,
                    MainImageUrl = null,
                    ImageUrls = new List<string>(),
                    Images = new List<CarImageInfo>()
                };

                return CreatedAtAction(nameof(GetCar), new { id = car.Id }, carDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create car listing", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing car listing (requires authentication, only owner can update)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCar(int id, [FromBody] UpdateCarRequest request)
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

                // Find the car
                var car = await _dbContext.Cars
                    .Include(c => c.Images)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (car == null)
                {
                    return NotFound(new { message = "Car not found." });
                }

                // Verify the user is the owner of the car
                if (car.SellerId != userId)
                {
                    return Forbid();
                }

                // Get make and model names from IDs
                var make = _carDataService.GetMakeById(request.MakeId);
                var model = _carDataService.GetModelById(request.MakeId, request.ModelId);

                if (make == null || model == null)
                {
                    return BadRequest(new { message = "Invalid make or model ID." });
                }

                // Update the car properties
                car.Brand = make.Name ?? string.Empty;
                car.Model = model.Name ?? string.Empty;
                car.Year = request.Year;
                car.FirstRegistrationDate = request.FirstRegistrationDate;
                car.Mileage = request.Mileage;
                car.PreviousOwners = request.PreviousOwners;
                car.FuelType = request.FuelType;
                car.EnginePower = request.EnginePower;
                car.Transmission = request.Transmission;
                car.Color = request.Color;
                car.EquipmentAndDetails = request.EquipmentAndDetails;
                
                // OriginalPrice should never change - it's set on creation and remains the original listing price
                // Only update the current price
                car.Price = request.Price;
                car.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                // Get the main image
                var mainImage = car.Images.FirstOrDefault(i => i.IsMain)
                                ?? car.Images.FirstOrDefault();

                // Return the updated car as DTO
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
                OriginalPrice = car.OriginalPrice,
                ViewCount = car.ViewCount,
                CreatedAt = car.CreatedAt,
                UpdatedAt = car.UpdatedAt,
                MainImageUrl = mainImage?.Url,
                ImageUrls = car.Images.Select(i => i.Url).ToList(),
                    Images = car.Images.Select(i => new CarImageInfo
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain
                    }).ToList()
                };

                return Ok(carDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update car listing", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload images for a car and optionally set the main image.
        /// </summary>
        [HttpPost("{id}/images")]
        [Authorize]
        public async Task<IActionResult> UploadImages(int id, [FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "No files uploaded." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var car = await _dbContext.Cars
                .Include(c => c.Images)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (car == null)
            {
                return NotFound(new { message = "Car not found." });
            }

            if (car.SellerId != userId)
            {
                return Forbid();
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            const long maxFileSize = 10 * 1024 * 1024; // 10MB per image

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cars");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var newImages = new List<CarImage>();

            foreach (var file in files)
            {
                if (file == null || file.Length == 0)
                {
                    continue;
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP." });
                }

                if (file.Length > maxFileSize)
                {
                    return BadRequest(new { message = "File size exceeds 10MB limit." });
                }

                var uniqueFileName = $"{car.Id}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var url = $"{baseUrl}/uploads/cars/{uniqueFileName}";

                var image = new CarImage
                {
                    CarId = car.Id,
                    Url = url,
                    IsMain = false
                };

                newImages.Add(image);
                car.Images.Add(image);
            }

            // If there is no main image yet, set the first new image as main
            if (!car.Images.Any(i => i.IsMain) && car.Images.Any())
            {
                var main = car.Images.First();
                main.IsMain = true;
            }

            await _dbContext.SaveChangesAsync();

            var mainImage = car.Images.FirstOrDefault(i => i.IsMain)
                            ?? car.Images.FirstOrDefault();

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
                OriginalPrice = car.OriginalPrice,
                CreatedAt = car.CreatedAt,
                UpdatedAt = car.UpdatedAt,
                MainImageUrl = mainImage?.Url,
                ImageUrls = car.Images.Select(i => i.Url).ToList(),
                Images = car.Images.Select(i => new CarImageInfo
                {
                    Id = i.Id,
                    Url = i.Url,
                    IsMain = i.IsMain
                }).ToList()
            };

            return Ok(carDto);
        }

        /// <summary>
        /// Delete a car image.
        /// </summary>
        [HttpDelete("{id}/images/{imageId}")]
        [Authorize]
        public async Task<IActionResult> DeleteImage(int id, int imageId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var car = await _dbContext.Cars
                .Include(c => c.Images)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (car == null)
            {
                return NotFound(new { message = "Car not found." });
            }

            if (car.SellerId != userId)
            {
                return Forbid();
            }

            var image = car.Images.FirstOrDefault(i => i.Id == imageId);
            if (image == null)
            {
                return NotFound(new { message = "Image not found." });
            }

            // Delete the physical file
            try
            {
                if (image.Url.StartsWith("http"))
                {
                    // Extract filename from URL
                    var uri = new Uri(image.Url);
                    var fileName = Path.GetFileName(uri.LocalPath);
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cars", fileName);
                    
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }
            catch
            {
                // Continue even if file deletion fails
            }

            // Remove from database
            _dbContext.CarImages.Remove(image);
            await _dbContext.SaveChangesAsync();

            // Reload car to get updated images
            await _dbContext.Entry(car).Collection(c => c.Images).LoadAsync();

            // Get updated car data
            var mainImage = car.Images.FirstOrDefault(i => i.IsMain)
                            ?? car.Images.FirstOrDefault();

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
                OriginalPrice = car.OriginalPrice,
                CreatedAt = car.CreatedAt,
                UpdatedAt = car.UpdatedAt,
                MainImageUrl = mainImage?.Url,
                ImageUrls = car.Images.Where(i => i.Id != imageId).Select(i => i.Url).ToList(),
                Images = car.Images.Where(i => i.Id != imageId).Select(i => new CarImageInfo
                {
                    Id = i.Id,
                    Url = i.Url,
                    IsMain = i.IsMain
                }).ToList()
            };

            return Ok(carDto);
        }

        /// <summary>
        /// Set a specific car image as the main image.
        /// </summary>
        [HttpPut("{id}/images/{imageId}/set-main")]
        [Authorize]
        public async Task<IActionResult> SetMainImage(int id, int imageId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var car = await _dbContext.Cars
                .Include(c => c.Images)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (car == null)
            {
                return NotFound(new { message = "Car not found." });
            }

            if (car.SellerId != userId)
            {
                return Forbid();
            }

            var image = car.Images.FirstOrDefault(i => i.Id == imageId);
            if (image == null)
            {
                return NotFound(new { message = "Image not found." });
            }

            foreach (var img in car.Images)
            {
                img.IsMain = false;
            }

            image.IsMain = true;
            await _dbContext.SaveChangesAsync();

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
                UpdatedAt = car.UpdatedAt,
                MainImageUrl = image.Url,
                ImageUrls = car.Images.Select(i => i.Url).ToList(),
                Images = car.Images.Select(i => new CarImageInfo
                {
                    Id = i.Id,
                    Url = i.Url,
                    IsMain = i.IsMain
                }).ToList()
            };

            return Ok(carDto);
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
                    .Include(c => c.Images)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (car == null)
                {
                    return NotFound(new { message = "Car not found." });
                }

                var mainImage = car.Images.FirstOrDefault(i => i.IsMain)
                                ?? car.Images.FirstOrDefault();

                // Increment view count
                car.ViewCount += 1;

                // Track view history for authenticated users (keep last 10)
                Guid? currentUserId = null;
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var parsedUserId))
                {
                    currentUserId = parsedUserId;
                }

                if (currentUserId.HasValue)
                {
                    var historyEntry = await _dbContext.ViewHistories
                        .FirstOrDefaultAsync(vh => vh.UserId == currentUserId.Value && vh.CarId == id);

                    if (historyEntry != null)
                    {
                        historyEntry.ViewedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        _dbContext.ViewHistories.Add(new ViewHistory
                        {
                            UserId = currentUserId.Value,
                            CarId = id,
                            ViewedAt = DateTime.UtcNow
                        });
                    }
                }

                await _dbContext.SaveChangesAsync();

                // Trim history to last 10 entries per user
                if (currentUserId.HasValue)
                {
                    var extraEntries = await _dbContext.ViewHistories
                        .Where(vh => vh.UserId == currentUserId.Value)
                        .OrderByDescending(vh => vh.ViewedAt)
                        .Skip(10)
                        .ToListAsync();

                    if (extraEntries.Count > 0)
                    {
                        _dbContext.ViewHistories.RemoveRange(extraEntries);
                        await _dbContext.SaveChangesAsync();
                    }
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
                OriginalPrice = car.OriginalPrice,
                ViewCount = car.ViewCount,
                CreatedAt = car.CreatedAt,
                UpdatedAt = car.UpdatedAt,
                MainImageUrl = mainImage?.Url,
                ImageUrls = car.Images.Select(i => i.Url).ToList(),
                    Images = car.Images.Select(i => new CarImageInfo
                    {
                        Id = i.Id,
                        Url = i.Url,
                        IsMain = i.IsMain
                    }).ToList(),
                    Seller = car.Seller != null ? new SellerInfo
                    {
                        Name = car.Seller.Name,
                        Surname = car.Seller.Surname,
                        PhoneNumber = car.Seller.PhoneNumber,
                        AvatarImageUrl = car.Seller.AvatarImageUrl
                    } : null
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
            [FromQuery] string? fuelType = null,
            [FromQuery] string? search = null)
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

                // Search by brand or model name
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var searchLower = search.ToLower();
                    query = query.Where(c => 
                        c.Brand.ToLower().Contains(searchLower) || 
                        c.Model.ToLower().Contains(searchLower) ||
                        (c.Brand + " " + c.Model).ToLower().Contains(searchLower)
                    );
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
                        OriginalPrice = c.OriginalPrice,
                        ViewCount = c.ViewCount,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt,
                        MainImageUrl = c.Images
                            .Where(i => i.IsMain)
                            .Select(i => i.Url)
                            .FirstOrDefault()
                            ?? c.Images.Select(i => i.Url).FirstOrDefault(),
                        ImageUrls = c.Images.Select(i => i.Url).ToList()
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

