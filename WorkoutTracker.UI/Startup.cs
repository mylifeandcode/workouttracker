using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StructureMap;
using WorkoutApplication.Data;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Repository;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;
using WorkoutApplication.Domain;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace WorkoutTracker
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder.WithOrigins("http://localhost:4200").AllowAnyMethod());
            });

            // Add framework services.
            services.AddMvc()
                .AddJsonOptions(
                    options => 
                        options.SerializerSettings.ReferenceLoopHandling = 
                            Newtonsoft.Json.ReferenceLoopHandling.Ignore)
                .AddControllersAsServices();

            //services.AddCors();
            //TODO: Clean up CORS code to only allow from specific origin
            var corsBuilder = new CorsPolicyBuilder();
            corsBuilder.AllowAnyHeader();
            corsBuilder.AllowAnyMethod();
            corsBuilder.AllowAnyOrigin();
            corsBuilder.AllowCredentials();
            services.AddCors(options =>
            {
                options.AddPolicy("SiteCorsPolicy", corsBuilder.Build());
            });

            var connection = Configuration.GetConnectionString("WorkoutTrackerDatabase");
            services.AddDbContext<WorkoutsContext>(options => options.UseLazyLoadingProxies().UseSqlServer(connection));

            return ConfigureIoC(services);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseMvcWithDefaultRoute();
            app.UseCors(options => options.WithOrigins("http://localhost:4200").AllowAnyMethod());

            using (var serviceScope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                serviceScope.ServiceProvider.GetService<WorkoutsContext>().Database.Migrate();
                serviceScope.ServiceProvider.GetService<WorkoutsContext>().EnsureSeedData();
            }
        }

        public IServiceProvider ConfigureIoC(IServiceCollection services)
        {
            //See this URL for more info:
            //https://andrewlock.net/getting-started-with-structuremap-in-asp-net-core/

            var container = new Container();

            container.Configure(config =>
            {
                // Register stuff in container, using the StructureMap APIs...
                config.Scan(_ =>
                {
                    _.AssemblyContainingType(typeof(Startup));
                    _.AssemblyContainingType(typeof(TargetAreaService));
                    _.WithDefaultConventions();
                });

                config.For<IRepository<TargetArea>>().Use<Repository<TargetArea>>();
                config.For<IRepository<User>>().Use<Repository<User>>();
                config.For<IRepository<Exercise>>().Use<Repository<Exercise>>();

                //Populate the container using the service collection
                config.Populate(services);
            });

            return container.GetInstance<IServiceProvider>();

        }

    }
}
