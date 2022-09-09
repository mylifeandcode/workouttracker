using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using WorkoutTracker.Data;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Repository;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Domain.Workouts;
using Microsoft.Extensions.Hosting;
using WorkoutTracker.Domain.Resistances;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System.Linq;
using WorkoutTracker.Application.Users;
using System.Reflection;
using WorkoutTracker.UI.Auth;
using WorkoutTracker.Application.Shared.Services;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Services;
using WorkoutTracker.Application.Users.Interfaces;

namespace WorkoutTracker
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.AddConfiguration(Configuration.GetSection("Logging"));
                loggingBuilder.AddConsole();
                loggingBuilder.AddDebug();
            });

            services.AddCors(options =>
            {
                options.AddPolicy("SiteCorsPolicy",
                    builder => builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().Build());
            });

            //services.AddSingleton<IConfiguration>(provider => this.Configuration);

            var connection = Configuration.GetConnectionString("WorkoutTrackerDatabase");
            services.AddDbContext<WorkoutsContext>(options =>
                            options.UseLazyLoadingProxies().UseSqlServer(connection));

            services.AddControllers()
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

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "WorkoutTrackerApi", Version = "v1" });
            });

            //Originally from https://www.codemag.com/Article/2105051/Implementing-JWT-Authentication-in-ASP.NET-Core-5 .
            //See also https://github.com/joydipkanjilal/jwt-aspnetcore/tree/master/jwt-aspnetcore for differences between the 
            //article's code and the code they implemented
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
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
        }

        public void ConfigureContainer(ContainerBuilder builder)
        {
            //builder.RegisterModule(new MyApplicationModule());
            /*
            var assemblies = AppDomain.CurrentDomain.GetAssemblies().Where(x => x.FullName.StartsWith("Workout")).ToArray();
            builder
                .RegisterAssemblyTypes(assemblies)
                .Where(t => t.Name.EndsWith("Service"))
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();
            */

            var assemblies =
                Assembly
                    .GetExecutingAssembly()
                    .GetReferencedAssemblies()
                    .Select((item) => Assembly.Load(item))
                    .Where(x => x.FullName.StartsWith("Workout")).ToArray();

            //We also need THIS assembly, the one we're running from right now            
            assemblies = assemblies.Concat(new Assembly[] { Assembly.GetExecutingAssembly() }).ToArray();

            builder.RegisterAssemblyTypes(assemblies)
               .Where(t => t.Name.EndsWith("Service"))
               .AsImplementedInterfaces();

            builder.RegisterAssemblyTypes(assemblies)
                .Where(t => t.Name.EndsWith("Repository"))
                .AsImplementedInterfaces();

            builder.RegisterAssemblyTypes(assemblies)
                .Where(t => t.Name.EndsWith("Adapter"))
                .AsImplementedInterfaces()
                .SingleInstance();

            builder.RegisterType<Repository<TargetArea>>().As<IRepository<TargetArea>>();
            builder.RegisterType<Repository<User>>().As<IRepository<User>>();
            builder.RegisterType<Repository<Exercise>>().As<IRepository<Exercise>>();
            builder.RegisterType<Repository<Workout>>().As<IRepository<Workout>>();
            builder.RegisterType<Repository<ExecutedWorkout>>().As<IRepository<ExecutedWorkout>>();
            builder.RegisterType<Repository<ResistanceBand>>().As<IRepository<ResistanceBand>>();
            builder.RegisterType<EmailService>().As<IEmailService>()
                .WithParameter("enabled", Configuration["SMTP:Enabled"])
                .WithParameter("host", Configuration["SMTP:Host"])
                .WithParameter("port", Configuration["SMTP:Port"])
                .WithParameter("username", Configuration["SMTP:Username"])
                .WithParameter("password", Configuration["SMTP:Password"]);

            builder.RegisterType<UserService>().As<IUserService>()
                .WithParameter("frontEndResetPasswordUrl", Configuration["FrontEndResetPasswordURL"]);
            //builder.RegisterType<Serilog.Log>().As<Microsoft.Extensions.Logging.ILogger>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "WorkoutTrackerApi v1"));
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseSerilogRequestLogging();

            app.UseCors();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            using (var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                serviceScope.ServiceProvider.GetService<WorkoutsContext>().Database.Migrate();
                serviceScope.ServiceProvider.GetService<WorkoutsContext>().EnsureSeedData();
            }
        }

        /*
        public Startup(IWebHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        //public IServiceProvider ConfigureServices(IServiceCollection services)
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.AddConfiguration(Configuration.GetSection("Logging"));
                loggingBuilder.AddConsole();
                loggingBuilder.AddDebug();
            });

            services.AddCors(options =>
            {
                options.AddPolicy("SiteCorsPolicy",
                    builder => builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().Build());
            });

            // Add framework services.
            services.AddMvc()
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
                    })
                        
                .AddControllersAsServices();


            var connection = Configuration.GetConnectionString("WorkoutTrackerDatabase");
            services.AddDbContext<WorkoutsContext>(options => 
                options.UseLazyLoadingProxies().UseSqlServer(connection));


            //Originally from https://www.codemag.com/Article/2105051/Implementing-JWT-Authentication-in-ASP.NET-Core-5 .
            //See also https://github.com/joydipkanjilal/jwt-aspnetcore/tree/master/jwt-aspnetcore for differences between the 
            //article's code and the code they implemented
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
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

            //return ConfigureIoC(services);
            ConfigureIoC(services);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)//, ILoggerFactory loggerFactory)
        {
            app.UseStaticFiles();
            app.UseRouting();
            //app.UseSpaStaticFiles();

            app.UseSerilogRequestLogging();

            //app.UseCors(options => options.WithOrigins("http://localhost:4200").AllowAnyMethod());
            app.UseCors();

            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();

            
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints => 
            {
                endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
            });

            using (var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                serviceScope.ServiceProvider.GetService<WorkoutsContext>().Database.Migrate();
                serviceScope.ServiceProvider.GetService<WorkoutsContext>().EnsureSeedData();
            }

        }

        //public IServiceProvider ConfigureIoC(IServiceCollection services)
        public void ConfigureIoC(IServiceCollection services)
        {
            var builder = new ContainerBuilder();

            var assemblies = AppDomain.CurrentDomain.GetAssemblies();
            builder
                .RegisterAssemblyTypes(assemblies)
                .Where(t => t.Name.EndsWith("Service"))
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();

            builder.RegisterType<Repository<TargetArea>>().As<IRepository<TargetArea>>();
            builder.RegisterType<Repository<User>>().As<IRepository<User>>();
            builder.RegisterType<Repository<Exercise>>().As<IRepository<Exercise>>();
            builder.RegisterType<Repository<Workout>>().As<IRepository<Workout>>();
            builder.RegisterType<Repository<ExecutedWorkout>>().As<IRepository<ExecutedWorkout>>();
            builder.RegisterType<Repository<ResistanceBand>>().As<IRepository<ResistanceBand>>();
            //builder.RegisterType<Serilog.Log>().As<Microsoft.Extensions.Logging.ILogger>();

            //config.For<Microsoft.Extensions.Logging.ILogger>().Use<Serilog.Log.Logger>().Singleton();

            var container = builder.Build();
            //return new AutofacServiceProvider(container);

        }
        */
    }
}
