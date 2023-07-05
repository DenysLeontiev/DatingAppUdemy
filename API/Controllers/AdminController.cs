using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;

        public AdminController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }


        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRole()
        {
            var usersWithRoles = await _userManager.Users.OrderBy(u => u.UserName).Select(u => new
            {
                Id = u.Id,
                UserName = u.UserName,
                Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
            }).ToListAsync();

            return Ok(usersWithRoles);
        }

        [Authorize(Policy="RequireAdminRole")]
        [HttpPost("edit-roles/{username}")]
        public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles)
        {
            if(string.IsNullOrWhiteSpace(roles))
            {
                return BadRequest("Roles are empty");
            }

            var user = await _userManager.FindByNameAsync(username);
            if(user == null)
            {
                return NotFound("User is not found");
            }
            
            var selectedRoles = roles.Trim().Split(",");

            var userRoles = await _userManager.GetRolesAsync(user);

            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles)); // here we add roles except that user alredy has
            if(!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles)); // here we remove old roles except new ones
            if(!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(await _userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public ActionResult GetPhotosForModeration()
        {
            return Ok("admins and moderators can see this");
        }
    }
}