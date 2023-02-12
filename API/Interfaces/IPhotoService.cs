using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet.Actions;

namespace API.Interfaces
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> UploadAsync(IFormFile file);
        Task<DeletionResult> DeleteAsync(string publicId);
    }
}