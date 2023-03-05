using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<AppUser>> GetUsersAsync(); 
        Task<AppUser> GetUserByIdAsync(int id);
        Task<AppUser> GetUserByUsernameAsync(string username);
        Task<bool> SaveAllAsync();
        void UpdateUser(AppUser user);
        Task<PagedList<MemberDto>> GetMembersAsync(UserParanms userParanms);
        Task<MemberDto> GetMemberAsync(string username);
    }
}