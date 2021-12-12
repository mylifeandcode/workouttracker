using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Serilog;

namespace WorkoutTracker
{
    public class Program
    {
        public static void Main(string[] args)
        {
            /*
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .UseApplicationInsights()
                .Build();

            host.Run();
            */
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
                    WebHost.CreateDefaultBuilder(args)
                        /*
                                    .ConfigureLogging((hostingContext, logging) =>
                                    {
                                        logging.AddConfiguration(hostingContext.Configuration.GetSection("Logging"));
                                        logging.AddConsole();
                                        logging.AddDebug();
                                    })
                        */
                        .UseSerilog((hostingContext, loggerConfiguration) => {
                            loggerConfiguration
                                .ReadFrom.Configuration(hostingContext.Configuration)
                                .Enrich.FromLogContext();
                                //.Enrich.WithProperty("ApplicationName", typeof(Program).Assembly.GetName().Name)
                                //.Enrich.WithProperty("Environment", hostingContext.HostingEnvironment);
                        })
                        .UseStartup<Startup>()
                        .Build();
    }
}
