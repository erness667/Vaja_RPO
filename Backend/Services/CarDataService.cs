using System.Text.Json;
using Backend.DTOs.CarCatalog;
using Microsoft.AspNetCore.Hosting;

namespace Backend.Services
{
    /// <summary>
    /// Service for loading and accessing car data from cars.json
    /// </summary>
    public class CarDataService
    {
        private readonly Dictionary<string, CarMakeData> _carData;
        private readonly Dictionary<string, MakeDto> _makesCache;
        private readonly object _lockObject = new object();
        private readonly IWebHostEnvironment _environment;

        public CarDataService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _carData = new Dictionary<string, CarMakeData>(StringComparer.OrdinalIgnoreCase);
            _makesCache = new Dictionary<string, MakeDto>(StringComparer.OrdinalIgnoreCase);
            LoadCarData();
        }

        private void LoadCarData()
        {
            try
            {
                var jsonPath = Path.Combine(_environment.ContentRootPath, "cars.json");
                
                if (!File.Exists(jsonPath))
                {
                    throw new FileNotFoundException($"cars.json not found at {jsonPath}");
                }

                var jsonContent = File.ReadAllText(jsonPath);
                var carDataDict = JsonSerializer.Deserialize<Dictionary<string, CarMakeData>>(
                    jsonContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                if (carDataDict != null)
                {
                    foreach (var kvp in carDataDict)
                    {
                        _carData[kvp.Key] = kvp.Value;
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to load car data from cars.json: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Get all available car makes
        /// </summary>
        public List<MakeDto> GetMakes()
        {
            lock (_lockObject)
            {
                if (_makesCache.Count == 0)
                {
                    var index = 1;
                    foreach (var makeName in _carData.Keys.OrderBy(k => k))
                    {
                        var slug = makeName.ToLowerInvariant()
                            .Replace(" ", "-")
                            .Replace("'", "")
                            .Replace(".", "")
                            .Replace("(", "")
                            .Replace(")", "");
                        
                        _makesCache[makeName] = new MakeDto
                        {
                            Id = index.ToString(),
                            Name = makeName,
                            Slug = slug
                        };
                        index++;
                    }
                }

                return _makesCache.Values.OrderBy(m => m.Name).ToList();
            }
        }

        /// <summary>
        /// Get make by ID
        /// </summary>
        public MakeDto? GetMakeById(string makeId)
        {
            var makes = GetMakes();
            return makes.FirstOrDefault(m => m.Id == makeId);
        }

        /// <summary>
        /// Get make by name
        /// </summary>
        public MakeDto? GetMakeByName(string makeName)
        {
            var makes = GetMakes();
            return makes.FirstOrDefault(m => 
                m.Name?.Equals(makeName, StringComparison.OrdinalIgnoreCase) == true);
        }

        /// <summary>
        /// Get models for a specific make
        /// </summary>
        public List<ModelDto> GetModels(string makeId)
        {
            var make = GetMakeById(makeId);
            if (make == null || string.IsNullOrEmpty(make.Name))
            {
                return new List<ModelDto>();
            }

            if (!_carData.TryGetValue(make.Name, out var makeData) || makeData.Models == null)
            {
                return new List<ModelDto>();
            }

            var models = new List<ModelDto>();
            var modelIndex = 1;
            
            foreach (var modelName in makeData.Models.OrderBy(m => m))
            {
                var slug = modelName.ToLowerInvariant()
                    .Replace(" ", "-")
                    .Replace("'", "")
                    .Replace(".", "")
                    .Replace("(", "")
                    .Replace(")", "");
                
                models.Add(new ModelDto
                {
                    Id = $"{makeId}-{modelIndex}",
                    Name = modelName,
                    Slug = slug,
                    MakeId = makeId,
                    MakeName = make.Name
                });
                modelIndex++;
            }

            return models;
        }

        /// <summary>
        /// Get model by ID
        /// </summary>
        public ModelDto? GetModelById(string makeId, string modelId)
        {
            var models = GetModels(makeId);
            return models.FirstOrDefault(m => m.Id == modelId);
        }

        /// <summary>
        /// Search for makes by name
        /// </summary>
        public List<MakeDto> SearchMakes(string query)
        {
            var allMakes = GetMakes();
            
            if (string.IsNullOrWhiteSpace(query))
            {
                return allMakes;
            }

            var queryLower = query.ToLowerInvariant();
            return allMakes
                .Where(m => m.Name?.ToLowerInvariant().Contains(queryLower) == true)
                .ToList();
        }
    }

    /// <summary>
    /// Model for deserializing car make data from JSON
    /// </summary>
    public class CarMakeData
    {
        public List<string> Models { get; set; } = new List<string>();
    }
}

