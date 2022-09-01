
namespace Location.Data
{
    public class Response
    {
        public bool Status { get; set; }
        public Location location { get; set; }
        public string Message { get; set; }
        public List<Location> List { get; set; }
        public int Count { get; set; }
    }
}
