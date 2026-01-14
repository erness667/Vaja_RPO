namespace Backend.DTOs.Dealership
{
    public class DealershipAnalyticsDto
    {
        // Overview statistics
        public OverviewStatsDto Overview { get; set; } = new();

        // Time series data
        public List<MonthlyStatsDto> MonthlyStats { get; set; } = new();

        // Top cars
        public List<TopCarDto> TopViewedCars { get; set; } = new();
        public List<TopCarDto> TopFavouriteCars { get; set; } = new();

        // Distributions
        public List<BrandDistributionDto> BrandDistribution { get; set; } = new();
        public List<FuelTypeDistributionDto> FuelTypeDistribution { get; set; } = new();

        // Worker activity
        public List<WorkerActivityDto> WorkerActivity { get; set; } = new();

        // Views over time
        public List<MonthlyViewsDto> ViewsOverTime { get; set; } = new();
    }

    public class OverviewStatsDto
    {
        public int TotalCars { get; set; }
        public decimal TotalValue { get; set; }
        public decimal AveragePrice { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public int TotalViews { get; set; }
        public int TotalFavourites { get; set; }
        public double AverageDaysOnMarket { get; set; }
    }

    public class MonthlyStatsDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int CarsCount { get; set; }
        public decimal TotalValue { get; set; }
        public decimal AveragePrice { get; set; }
        public int ViewsCount { get; set; }
    }

    public class TopCarDto
    {
        public int CarId { get; set; }
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public decimal Price { get; set; }
        public int ViewCount { get; set; }
        public int FavouriteCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalViewCount { get; set; } // Total views including anonymous
    }

    public class BrandDistributionDto
    {
        public string Brand { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalValue { get; set; }
        public decimal AveragePrice { get; set; }
    }

    public class FuelTypeDistributionDto
    {
        public string FuelType { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalValue { get; set; }
        public decimal AveragePrice { get; set; }
    }

    public class WorkerActivityDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserSurname { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int CarsPosted { get; set; }
        public decimal TotalValuePosted { get; set; }
    }

    public class MonthlyViewsDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int ViewsCount { get; set; }
    }
}
