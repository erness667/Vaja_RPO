namespace SuperCarsApi.Models
{
    public class Car
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Brand { get; set; }
        public int Year { get; set; }
        public int Horsepower { get; set; }
        public decimal Price { get; set; }
    }
}