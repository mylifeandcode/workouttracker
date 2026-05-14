var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.WorkoutTracker_API>("api")
    .WithExternalHttpEndpoints();

var frontend = builder.AddViteApp("frontend", "../../workout-tracker")
    .WithRunScript("start")
    .WithEnvironment("API_HTTP", api.GetEndpoint("http"))
    .WithExternalHttpEndpoints()
    .WaitFor(api);

builder.Build().Run();
