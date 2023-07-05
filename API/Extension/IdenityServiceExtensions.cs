using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace API.Extension
{
    public static class IdenityServiceExtensions
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
        {

            services.AddIdentityCore<AppUser>(opts =>
            {
                opts.Password.RequireNonAlphanumeric = false;
            })
                .AddRoles<AppRole>()
                .AddRoleManager<RoleManager<AppRole>>() // class is used for accessing and managing roles.
                .AddEntityFrameworkStores<DataContext>();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"])),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };

                    // options.Events = new JwtBearerEvents
                    // {
                    //     OnMessageReceived = context =>
                    //     {
                    //         var accessToken = context.Request.Query["access_token"];

                    //         // If the request is for our hub...
                    //         var path = context.HttpContext.Request.Path;
                    //         if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/hubs")))
                    //         {
                    //             // Read the token out of the query string and save that for further use 
                    //             context.Token = accessToken; // remember that fot further use
                    //         }
                            
                    //         return Task.CompletedTask;
                    //     }
                    // };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && 
                                path.StartsWithSegments("/hubs"))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddAuthorization(opts =>
            {
                opts.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
                opts.AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Moderator"));
                opts.AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin"));
            });

            return services;
        }
    }
}