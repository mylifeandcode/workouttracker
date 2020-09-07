using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;
using StructureMap;
using WorkoutApplication.Data;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Repository;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;
using WorkoutApplication.Domain;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.SpaServices.Extensions;
using WorkoutApplication.Domain.Workouts;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Hosting;

namespace WorkoutTracker
{
    public class Startup
    {
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

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.AddConfiguration(Configuration.GetSection("Logging"));
                loggingBuilder.AddConsole();
                loggingBuilder.AddDebug();
            });
            
            services.AddCors(options =>
            {
                /*
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder.WithOrigins("http://localhost:4200").AllowAnyMethod());
                */
                options.AddPolicy("SiteCorsPolicy",
                    builder => builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().Build());
            });

            // Add framework services.
            services.AddMvc()
                .AddNewtonsoftJson(
                    options => 
                        options.SerializerSettings.ReferenceLoopHandling = 
                            Newtonsoft.Json.ReferenceLoopHandling.Ignore)
                .AddControllersAsServices();

            //In their attempts to optimize performance, Microsoft replaced JSON.NET in .NET Core 3.
            //But they didn't provide a way to handle reference loops. Therefore, the below code 
            //remains commented out in favor of the "old way", with the added JSON.NET reference, above.
            /*
            services.AddMvc().AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.PropertyNamingPolicy = null;
                o.JsonSerializerOptions.DictionaryKeyPolicy = null;
            })
            .AddControllersAsServices();
            */


            var connection = Configuration.GetConnectionString("WorkoutTrackerDatabase");
            services.AddDbContext<WorkoutsContext>(options => options.UseLazyLoadingProxies().UseSqlServer(connection));

            /*
            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "workout-tracker/dist";
            });
            */

            return ConfigureIoC(services);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)//, ILoggerFactory loggerFactory)
        {
            //app.UseMvcWithDefaultRoute();

            app.UseStaticFiles();
            app.UseRouting();
            //app.UseSpaStaticFiles();

            //app.UseCors(options => options.WithOrigins("http://localhost:4200").AllowAnyMethod());
            app.UseCors();

            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();

            /*
            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                //spa.Options.SourcePath = "workout-tracker";

                if (env.IsDevelopment())
                {
                    //spa.UseAngularCliServer(npmScript: "start")
                    app.UseDeveloperExceptionPage();

                }
            });
            */

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
                config.For<IRepository<Workout>>().Use<Repository<Workout>>();
                config.For<IRepository<ExecutedWorkout>>().Use<Repository<ExecutedWorkout>>();

                //Populate the container using the service collection
                config.Populate(services);
            });

            return container.GetInstance<IServiceProvider>();

        }
    }
}
