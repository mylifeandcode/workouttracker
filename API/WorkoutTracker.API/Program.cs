﻿using Autofac;
using Autofac.Core;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Extensions.Hosting;
using System.Configuration;
using System.Reflection;
using System.Reflection.PortableExecutable;
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

// Add services to the container
RegisterStuff(builder);
SetupLogging(builder);

builder.Services.AddControllers()
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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WorkoutTrackerApi", Version = "v1" });
});


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

var connection = builder.Configuration.GetConnectionString("WorkoutTrackerDatabase");
builder.Services.AddDbContext<WorkoutsContext>(options =>
                options.UseLazyLoadingProxies().UseSqlServer(connection));

builder.Services.AddIdentityApiEndpoints<User>()
    .AddEntityFrameworkStores<WorkoutsContext>();

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapIdentityApi<User>();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.UseSerilogRequestLogging();
app.UseCors();
app.MapControllers();
app.Run();



/*
                //Originally from https://www.codemag.com/Article/2105051/Implementing-JWT-Authentication-in-ASP.NET-Core-5 .
                //See also https://github.com/joydipkanjilal/jwt-aspnetcore/tree/master/jwt-aspnetcore for differences between the 
                //article's code and the code they implemented
            app.Services.UseAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = Configuration["Jwt:Issuer"],
                    ValidAudience = Configuration["Jwt:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
                };
            });

*/


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
void RegisterStuff(WebApplicationBuilder appBuilder)
{
    //https://stackoverflow.com/questions/69754985/adding-autofac-to-net-core-6-0-using-the-new-single-file-template

    appBuilder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

    var assemblies =
        Assembly
            .GetExecutingAssembly()
            .GetReferencedAssemblies()
            .Select((item) => Assembly.Load(item))
            .Where(x => x.FullName.StartsWith("Workout")).ToArray();

    //We also need THIS assembly, the one we're running from right now            
    assemblies = assemblies.Concat(new Assembly[] { Assembly.GetExecutingAssembly() }).ToArray();

    appBuilder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
    {
        containerBuilder.RegisterAssemblyTypes(assemblies)
           .Where(t => t.Name.EndsWith("Service"))
           .AsImplementedInterfaces();

        containerBuilder.RegisterAssemblyTypes(assemblies)
            .Where(t => t.Name.EndsWith("Repository"))
            .AsImplementedInterfaces();

        containerBuilder.RegisterAssemblyTypes(assemblies)
            .Where(t => t.Name.EndsWith("Mapper"))
            .AsImplementedInterfaces()
            .SingleInstance();

        containerBuilder.RegisterType<Repository<TargetArea>>().As<IRepository<TargetArea>>();
        containerBuilder.RegisterType<Repository<User>>().As<IRepository<User>>();
        containerBuilder.RegisterType<Repository<Exercise>>().As<IRepository<Exercise>>();
        containerBuilder.RegisterType<Repository<Workout>>().As<IRepository<Workout>>();
        containerBuilder.RegisterType<Repository<ExecutedWorkout>>().As<IRepository<ExecutedWorkout>>();
        containerBuilder.RegisterType<Repository<ResistanceBand>>().As<IRepository<ResistanceBand>>();

        containerBuilder.RegisterType<EmailService>().As<IEmailService>()
            .WithParameter("enabled", appBuilder.Configuration["SMTP:Enabled"])
            .WithParameter("host", appBuilder.Configuration["SMTP:Host"])
            .WithParameter("port", appBuilder.Configuration["SMTP:Port"])
            .WithParameter("username", appBuilder.Configuration["SMTP:Username"])
            .WithParameter("password", appBuilder.Configuration["SMTP:Password"]);

        containerBuilder.RegisterType<UserService>().As<IUserService>()
            .WithParameter("frontEndResetPasswordUrl", appBuilder.Configuration["FrontEndResetPasswordURL"]);
    });

    

}

void SetupLogging(WebApplicationBuilder appBuilder)
{
    appBuilder.Services.AddSingleton<DiagnosticContext>();

    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(appBuilder.Configuration)
        .Enrich.FromLogContext()
        .CreateLogger();

    appBuilder.Host.UseSerilog();
}