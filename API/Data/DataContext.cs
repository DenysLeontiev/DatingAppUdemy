using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext : IdentityDbContext<AppUser, AppRole, int, 
                               IdentityUserClaim<int>, AppUserRole, IdentityUserLogin<int>, 
                               IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {

        }

        public DbSet<UserLike> Likes { get; set; }
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AppUser>() // here we configure many-to-many relationship between AppUser and AppRole
                        .HasMany(x => x.UserRoles)
                        .WithOne(x => x.User)
                        .HasForeignKey(x => x.UserId)
                        .IsRequired();
            
            modelBuilder.Entity<AppRole>()
                        .HasMany(x => x.UserRoles)
                        .WithOne(x => x.Role)
                        .HasForeignKey(x => x.RoleId)
                        .IsRequired();

            modelBuilder.Entity<UserLike>().HasKey(k => new { k.SourceUserId, k.TargetUserId }); // HasKey == ForeingKey

            modelBuilder.Entity<UserLike>()
                .HasOne(s => s.SourceUser)
                .WithMany(t => t.LikedUsers)
                .HasForeignKey(x => x.SourceUserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserLike>()
                .HasOne(t => t.TargetUser)
                .WithMany(l => l.LikedByUsers)
                .HasForeignKey(x => x.TargetUserId)
                .OnDelete(DeleteBehavior.Cascade); // for SqlServer DeleteBehavior.NoAction

            modelBuilder.Entity<Message>()  // one reciever has many recieved messages
                .HasOne(user => user.Recipient)
                .WithMany(m => m.MessagesRecieved)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>() // on sender has many send messages
                .HasOne(user => user.Sender)
                .WithMany(s => s.MessagesSend)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}