using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;

        public PhotoService(IOptions<CloudinarySettings> config)
        {
            Account acc = new Account(config.Value.CloudName, config.Value.ApiKey, config.Value.ApiSecret);

            _cloudinary = new Cloudinary(acc);
        }

        public async Task<ImageUploadResult> UploadAsync(IFormFile file)
        {
            ImageUploadResult uploadResult = new ImageUploadResult();

            if(file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream), // (nameOfTheFile, its content in stream);
                    Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
                    Folder = "DatingAppPractice", //  folder where it will be located on CloudinaryWebSite
                };

                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            return uploadResult;
        }

        public async Task<DeletionResult> DeleteAsync(string publicId)
        {
            DeletionParams deletionParams = new DeletionParams(publicId);
            DeletionResult deletionResult = await _cloudinary.DestroyAsync(deletionParams);
            return deletionResult;
        }
    }
}