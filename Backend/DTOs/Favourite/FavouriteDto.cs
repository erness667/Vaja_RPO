using Backend.DTOs.Car;

namespace Backend.DTOs.Favourite
{
    public class FavouriteDto
    {
        public int Id { get; set; }
        public int CarId { get; set; }
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// The favourited car details
        /// </summary>
        public CarDto? Car { get; set; }
    }
}

