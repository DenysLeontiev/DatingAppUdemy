using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Exceptions
{
    public class ApiExceptions
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }

        public ApiExceptions(int statusCode, string message, string details)
        {
            StatusCode = statusCode;
            Message = message;
            Details = details;
        }
    }
}