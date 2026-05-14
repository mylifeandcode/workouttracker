var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("env");

var sql = builder.AddSqlServer("sql")
    .WithDataVolume()
    .AddDatabase("WorkoutTrackerDatabase");

var api = builder.AddProject<Projects.WorkoutTracker_API>("api")
    .WithReference(sql)
    .WaitFor(sql)
    .WithExternalHttpEndpoints();

var frontend = builder.AddViteApp("frontend", "../../workout-tracker")
    .WithRunScript("start")
    .WithEnvironment("API_HTTP", api.GetEndpoint("http"))
    .WithExternalHttpEndpoints()
    .WaitFor(api);

builder.Build().Run();
