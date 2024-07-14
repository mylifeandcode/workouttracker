using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Reflection;
using System.Text;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Shared.Services;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Services;
using WorkoutTracker.Data;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services
    .AddControllers()
    .AddNewtonsoftJson(
        options =>
        {
            options
                .SerializerSettings
                .ReferenceLoopHandling =
                    Newtonsoft.Json.ReferenceLoopHandling.Ignore;

            options
                .SerializerSettings
                .DateTimeZoneHandling =
                    Newtonsoft.Json.DateTimeZoneHandling.Utc;
        });
    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.AddConfiguration(builder.Configuration.GetSection("Logging"));
    loggingBuilder.AddConsole();
    loggingBuilder.AddDebug();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("SiteCorsPolicy",
        builder => builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().Build());
});

builder.Services.AddDbContext<WorkoutsContext>(
    options =>
        options
            .UseLazyLoadingProxies()
            .UseSqlServer(builder.Configuration.GetConnectionString("WorkoutTrackerDatabase")));

//TODO: Add Identity to existing DB context
/*
builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseSqlServer("Server=.;Database=IdentityAPITest;Trusted_Connection=True;TrustServerCertificate=true"));


builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
*/

//TODO: Remove this when the above Identity implementation is in place
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});


builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory())
    .ConfigureContainer<ContainerBuilder>((container) =>
    {
        var assemblies =
            Assembly
                .GetExecutingAssembly()
                .GetReferencedAssemblies()
                .Select((item) => Assembly.Load(item))
                .Where(x => x.FullName.StartsWith("Workout")).ToArray();

        //We also need THIS assembly, the one we're running from right now            
        assemblies = assemblies.Concat(new Assembly[] { Assembly.GetExecutingAssembly() }).ToArray();

        container.RegisterAssemblyTypes(assemblies)
           .Where(t => t.Name.EndsWith("Service"))
           .AsImplementedInterfaces();

        container.RegisterAssemblyTypes(assemblies)
            .Where(t => t.Name.EndsWith("Repository"))
            .AsImplementedInterfaces();

        container.RegisterAssemblyTypes(assemblies)
            .Where(t => t.Name.EndsWith("Mapper"))
            .AsImplementedInterfaces()
            .SingleInstance();

        container.RegisterType<Repository<TargetArea>>().As<IRepository<TargetArea>>();
        container.RegisterType<Repository<User>>().As<IRepository<User>>();
        container.RegisterType<Repository<Exercise>>().As<IRepository<Exercise>>();
        container.RegisterType<Repository<Workout>>().As<IRepository<Workout>>();
        container.RegisterType<Repository<ExecutedWorkout>>().As<IRepository<ExecutedWorkout>>();
        container.RegisterType<Repository<ResistanceBand>>().As<IRepository<ResistanceBand>>();
        container.RegisterType<EmailService>().As<IEmailService>()
            .WithParameter("enabled", builder.Configuration["SMTP:Enabled"])
            .WithParameter("host", builder.Configuration["SMTP:Host"])
            .WithParameter("port", builder.Configuration["SMTP:Port"])
            .WithParameter("username", builder.Configuration["SMTP:Username"])
            .WithParameter("password", builder.Configuration["SMTP:Password"]);

        container.RegisterType<UserService>().As<IUserService>()
            .WithParameter("frontEndResetPasswordUrl", builder.Configuration["FrontEndResetPasswordURL"]);
    })
    .UseSerilog((hostingContext, loggerConfiguration) =>
    {
        loggerConfiguration
            .ReadFrom.Configuration(hostingContext.Configuration)
            .Enrich.FromLogContext();
        //.Enrich.WithProperty("ApplicationName", typeof(Program).Assembly.GetName().Name)
        //.Enrich.WithProperty("Environment", hostingContext.HostingEnvironment);
    });


var app = builder.Build();

//TODO: Enable Identity API
//app.MapIdentityApi<IdentityUser>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseSerilogRequestLogging();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

//TODO: Remove in favor of a better solution
using (var serviceScope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
{
    serviceScope.ServiceProvider.GetService<WorkoutsContext>().Database.Migrate();
    serviceScope.ServiceProvider.GetService<WorkoutsContext>().EnsureSeedData();
}

app.Run();


/*
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Autofac.Extensions.DependencyInjection;
using Serilog;
using Microsoft.Extensions.Hosting;

namespace WorkoutTracker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseServiceProviderFactory(new AutofacServiceProviderFactory())
                .UseSerilog((hostingContext, loggerConfiguration) => {
                    loggerConfiguration
                        .ReadFrom.Configuration(hostingContext.Configuration)
                        .Enrich.FromLogContext();
                    //.Enrich.WithProperty("ApplicationName", typeof(Program).Assembly.GetName().Name)
                    //.Enrich.WithProperty("Environment", hostingContext.HostingEnvironment);
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                        .UseStartup<Startup>();
                });

    }
}
*/
