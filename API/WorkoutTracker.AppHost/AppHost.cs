var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("env");

var sql = builder.AddSqlServer("sql")
    .WithDataVolume()
    .AddDatabase("WorkoutTrackerDatabase");

// The API is now only called by the BFF, so it no longer needs to be exposed externally.
var api = builder.AddProject<Projects.WorkoutTracker_API>("api")
    .WithReference(sql)
    .WaitFor(sql);

// The BFF holds the user's session and forwards /api calls to the API with the access token attached. Api:BaseUrl is the
// single place the BFF learns the API's address. It is deliberately NOT external: the browser only ever talks to the
// frontend's origin (the Angular dev server or nginx), which proxies /api and /bff to the BFF over the internal network.
var bff = builder.AddProject<Projects.WorkoutTracker_BFF>("bff")
    .WithEnvironment("Api__BaseUrl", api.GetEndpoint("http"))
    .WaitFor(api);

var frontend = builder.AddViteApp("frontend", "../../workout-tracker")
    .WithRunScript("start")
    .WithEnvironment("BFF_HTTP", bff.GetEndpoint("http"))
    .WithExternalHttpEndpoints()
    .WaitFor(bff);

builder.Build().Run();
