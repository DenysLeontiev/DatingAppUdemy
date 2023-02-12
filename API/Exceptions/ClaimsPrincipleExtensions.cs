using  System.Security.Claims;

namespace API.Exceptions
{
    public static class ClaimsPrincipleExtensions
    {
        public static string GetUsername(this ClaimsPrincipal claimsPrinciple)
        {
            return claimsPrinciple.FindFirst(ClaimTypes.NameIdentifier).Value;
        }
    }
}