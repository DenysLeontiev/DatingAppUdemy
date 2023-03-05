using API.DTOs;
using API.Entities;
using API.Exceptions;
using API.Extension;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        public UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _photoService = photoService;
        }

        // [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<PagedList<MemberDto>>> GetUsers([FromQuery] UserParanms userParanms) // https://localhost:5001/users/?pageNumber=1&pageSize=5
        {
            var username = User.GetUsername();
            var user = await _userRepository.GetUserByUsernameAsync(username);
            userParanms.CurrentUsername = username;

            if (string.IsNullOrEmpty(userParanms.Gender))
            {
                userParanms.Gender = user.Gender == "male" ? "female" : "male";
            }

            var users = await _userRepository.GetMembersAsync(userParanms);
            Response.AddPaginationHeader(new PaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages));
            return Ok(users);
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            var user = await _userRepository.GetMemberAsync(username);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdatedDto)
        {
            var username = User.GetUsername();
            var user = await _userRepository.GetUserByUsernameAsync(username);

            if (user == null) return NotFound();

            _mapper.Map(memberUpdatedDto, user); // no need in AddAsync();

            if (await _userRepository.SaveAllAsync())
            {
                return NoContent();
            }

            return BadRequest();
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            string username = User.GetUsername();
            var user = await _userRepository.GetUserByUsernameAsync(username);

            if (user is null) return BadRequest();

            var result = await _photoService.UploadAsync(file);

            if (result.Error != null) return BadRequest(result.Error.Message);

            Photo photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
            };

            if (user.Photos.Count == 0) photo.IsMain = true;

            user.Photos.Add(photo);

            if (await _userRepository.SaveAllAsync()) // do not have to save because EF in Reposiory already odes that
            {
                return CreatedAtAction(nameof(GetUser), new { username = user.UserName }, _mapper.Map<PhotoDto>(photo));
                // return _mapper.Map<PhotoDto>(photo);
            }

            return BadRequest("Error happend during photo upload");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());

            if (user is null) return NotFound();

            var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

            if (photo is null) return NotFound();

            if (photo.IsMain) return BadRequest("Already your main photo");

            var mainPhoto = user.Photos.FirstOrDefault(p => p.IsMain);
            if (mainPhoto != null) mainPhoto.IsMain = false;

            photo.IsMain = true;

            if (await _userRepository.SaveAllAsync())
            {
                return NoContent();
            }

            return BadRequest();
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());

            var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

            if (photo is null)
            {
                return NotFound();
            }

            if (photo.IsMain)
            {
                return BadRequest("You can not delete your main photo");
            }

            if (photo.PublicId is not null)
            {
                var result = await _photoService.DeleteAsync(photo.PublicId);

                if (result.Error is not null)
                {
                    return BadRequest(result.Error.Message);
                }
            }

            user.Photos.Remove(photo);

            if (await _userRepository.SaveAllAsync())
            {
                return NoContent();
            }

            return BadRequest("An error happend during photo deletion");
        }
    }
}