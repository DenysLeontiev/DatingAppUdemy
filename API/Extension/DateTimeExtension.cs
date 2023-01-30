using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Extension
{
    public static class DateTimeExtension
    {
        public static int CalculateAge(this DateOnly birthDate)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var age = today.Year - birthDate.Year;
            if(birthDate > today.AddYears(-age)) age--;
            return age;
        }
    }
}