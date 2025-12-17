using Backend.DTOs.Car;

namespace Backend.DTOs.ViewHistory
{
    public class ViewHistoryDto
    {
        public int Id { get; set; }
        public int CarId { get; set; }
        public DateTime ViewedAt { get; set; }
        public CarDto? Car { get; set; }
    }
}

