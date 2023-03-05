using  System.Security.Claims;

namespace API.Exceptions
{
    public static class ClaimsPrincipleExtensions
    {
        public static string GetUsername(this ClaimsPrincipal claimsPrinciple)
        {
            return claimsPrinciple.FindFirst(ClaimTypes.Name).Value;  //NameId == ClaimTypes.Name
        }

        public static int GetUserId(this ClaimsPrincipal claimsPrinciple)
        {
            return int.Parse(claimsPrinciple.FindFirst(ClaimTypes.NameIdentifier).Value); // ClaimTypes.NameIdentifier == UniqueName
        }
    }
}