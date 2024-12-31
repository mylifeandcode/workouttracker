using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class AuthContext : IdentityDbContext<IdentityUser>
{
    public AuthContext(DbContextOptions<AuthContext> options) :
        base(options)
    { }
}