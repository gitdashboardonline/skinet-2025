using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class RoleConfiguration : IEntityTypeConfiguration<IdentityRole>
{
    public void Configure(EntityTypeBuilder<IdentityRole> builder)
    {
        builder.HasData(
            new IdentityRole
            {
                //Id = Guid.NewGuid().ToString(),
                Id = "efwjnjkengkjejda3212",
                Name = "Admin",
                NormalizedName = "ADMIN"
            },
            new IdentityRole
            {
                Id = "kjejkjkhdjwjejdjwbskj3223",
                Name = "Customer",
                NormalizedName = "CUSTOMER"
            }
        );
    }
}
