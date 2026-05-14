var builder = DistributedApplication.CreateBuilder(args);

// Add the following line to configure the Docker Compose environment
builder.AddDockerComposeEnvironment("env");

var api = builder.AddProject<Projects.WorkoutTracker_API>("api")
    .WithExternalHttpEndpoints();

var frontend = builder.AddViteApp("frontend", "../../workout-tracker")
    .WithRunScript("start")
    .WithEnvironment("API_HTTP", api.GetEndpoint("http"))
    .WithExternalHttpEndpoints()
    .WaitFor(api);

builder.Build().Run();
