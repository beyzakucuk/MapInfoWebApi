using Microsoft.AspNetCore.Mvc;
using Location.Data;
using System;
using System.Linq;
using System.Collections.Generic;

namespace StajDbContext.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {

        private readonly LocationDbContext _dbContext;
        public LocationController(LocationDbContext dataAccessProvider)
        {
            _dbContext = dataAccessProvider;
        }

        [HttpGet]
        public Response Get()
        {

            return _dbContext.GetAll();

        }

        [HttpPost]
        public Response Create([FromBody] Location.Data.Location location)
        {

            
                return _dbContext.Add(location);
           
        }

        [HttpGet("{id}")]
        public Response Details(int id)
        {
            try
            {
                return _dbContext.GetSingle(id);
            }
            catch (Exception ex)
            {
                Response response = new Response();
                response.Message = ex.Message;
            }
            return null;
        }

        [HttpPut]
        public Response Edit([FromBody]Location.Data.Location location)
        {
            // if (ModelState.IsValid)
            try
            {
                return _dbContext.Update(location);
            }
            catch (Exception ex)
            {
                Response response = new Response();
                response.Message = ex.Message;
            }
            return null;


        }

        [HttpDelete("{id}")]
        public Response DeleteConfirmed(int id)
        {

            try
            {
                return _dbContext.Delete(id);
            }
            catch (Exception ex)
            {
                Response response = new Response();
                response.Message = ex.Message;
            }
            return null;
        }
    }
}
