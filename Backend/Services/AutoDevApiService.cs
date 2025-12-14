using Backend.DTOs.CarApi;

namespace Backend.Services
{
    /// <summary>
    /// Service for accessing car makes and models from local cars.json file
    /// </summary>
    public class AutoDevApiService
    {
        private readonly CarDataService _carDataService;

        public AutoDevApiService(CarDataService carDataService)
        {
            _carDataService = carDataService;
        }

        /// <summary>
        /// Get all available car makes
        /// </summary>
        public Task<List<MakeDto>> GetMakesAsync()
        {
            var makes = _carDataService.GetMakes();
            return Task.FromResult(makes);
        }

        /// <summary>
        /// Get models for a specific make
        /// </summary>
        public Task<List<ModelDto>> GetModelsAsync(string makeId)
        {
            var models = _carDataService.GetModels(makeId);
            return Task.FromResult(models);
        }

        /// <summary>
        /// Search for makes by name (useful for autocomplete)
        /// </summary>
        public Task<List<MakeDto>> SearchMakesAsync(string query)
        {
            var makes = _carDataService.SearchMakes(query);
            return Task.FromResult(makes);
        }
    }
}

