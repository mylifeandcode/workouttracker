var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("env");

var sql = builder.AddSqlServer("sql")
    .WithDataVolume()
    .AddDatabase("WorkoutTrackerDatabase");

//JWT signing key. Never stored in the repo: when running, Aspire takes it from the AppHost's user-secrets
//(Parameters:jwt-key) or prompts for it in the dashboard; when published to Docker Compose it becomes
//JWT_KEY in the generated .env file.
var jwtKey = builder.AddParameter("jwt-key", secret: true);

var api = builder.AddProject<Projects.WorkoutTracker_API>("api")
    .WithReference(sql)
    .WithEnvironment("Jwt__Key", jwtKey)
    .WaitFor(sql)
    .WithExternalHttpEndpoints();

var frontend = builder.AddViteApp("frontend", "../../workout-tracker")
    .WithRunScript("start")
    .WithEnvironment("API_HTTP", api.GetEndpoint("http"))
    .WithExternalHttpEndpoints()
    .WaitFor(api);

builder.Build().Run();
