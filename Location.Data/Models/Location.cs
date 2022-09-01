using Microsoft.EntityFrameworkCore;

namespace Location.Data
{
    public class Location
    {
            public int Id { get; set; }
            public string Name { get; set; }
            public double X { get; set; }
            public double Y { get; set; }
        
    }

}

