using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Location.Data
{
    public class LocationDbContext:DbContext
    {
        public LocationDbContext(DbContextOptions<LocationDbContext> dbContextOptions) :
            base(dbContextOptions)
        {
          
        }
        public DbSet<Location> Locations { get; set; }
       
        public Response Add(Location location)
        {
            Response response = new Response();
            string temp = location.Name.Trim();
            if (location.Id != 0)
            {
                response.Message = "Id değerini değiştiremezsiniz! Ekleme başarısız!";
                return response;
            }
            if (location.Name == "string" || location.Name == null || temp == String.Empty)
            {
                 response.Message = "İsim bilgisi  eksik olamaz! Ekleme başarısız!";
                return response;
            }
            if (location.X == 0 || location.Y == 0)
            {
                response.Message = "Koordinat bilgisi eksik olamaz! Ekleme başarısız!";
                return response;
            }
            location.Name = location.Name.ToLower(new CultureInfo("tr-TR", false));
            Location tmp = (from x in Locations
                            where x.Name.ToLower() == location.Name
                            select x).FirstOrDefault();
            if (tmp != null)
            {
                response.Message = location.Name + " isimli kayıt zaten mevcut.";
                
                return response;
            }
            else
            {
                Locations.Add(location);
                SaveChanges();
                response.location = location;
                response.Message = "Bu konum eklendi";
                response.Status = true;
                response.List = Locations.ToList();
                response.Count = response.List.Count();

                return response;
            }
        }

        public Response Delete(int id)
        {
            Response response = new();

            Location location = (from x in Locations
                                 where x.Id == id
                                 select x).FirstOrDefault();
            if (location == null)
            {
                response.Message = id + " ID'li bir kayıt yoktur.";
                return response;
            }
            response.location = location;
            Locations.Remove(location);
            SaveChanges();
            response.List = Locations.ToList();
            response.Message = "Bu kayıt silindi.";
            response.Status = true;
            response.Count = response.List.Count;
            return response;
        }

        public Response GetAll()
        {
            Response response = new();
            response.List = Locations.OrderBy(x => x.Id).ToList();
            response.Status = true;
            response.Message = "Bütün veriler ekrana basılmıştır.";
            response.Count = response.List.Count();
            return response;

        }

        public Response GetSingle(int id)
        {

            Response response = new();
            Location location = (from x in Locations
                                 where x.Id == id
                                 select x).FirstOrDefault();
            if (location == null)
            {
                response.Message = id + " ID'li bir kayıt yoktur.";
                return response;
            }
            response.location = location;
            response.Message = ("Kayıt ekrana yazdırıldı.");
            response.Status = true;
            response.Count = Locations.ToList().Count();
            return response;
        }

        public Response Update(Location location)
        {
            string message = "";

            Response response = new();

            Location tmp = (from x in Locations
                            where x.Id == location.Id
                            select x).FirstOrDefault();
            if (tmp == null)
            {
                response.Message = location.Id + " ID'li bir kayıt yoktur.";
                return response;
            }
            string temp = location.Name.Trim();

            if (location.Name == "string" || location.Name == null || temp == String.Empty)
            {
                location.Name = tmp.Name;
            }
            else
                message = " name: " + location.Name;

            if (location.X == 0)
            {

                location.X = tmp.X;
            }
            else
                message = message + " x: " + location.X.ToString();

            if (location.Y == 0)
            {

                location.Y = tmp.Y;

            }
            else
                message = message + " y: " + location.Y.ToString();
            response.location = tmp;
            Locations.Remove(tmp);
            Locations.Update(location);
            SaveChanges();
            if (message == string.Empty)
                response.Message = location.Id + " ID'li kayıt için değişiklik yapmadınız.";
            else
                response.Message = "Bu kayıt ---" + message + " --- olarak güncellendi.";

            response.Status = true;
            response.Count = Locations.ToList().Count;
            response.List = new();
            response.List.Add(location);
            return response;
        }

    }
}
