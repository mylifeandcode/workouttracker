using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages;
using Serilog;
using Serilog.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json.Nodes;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
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

builder.Services.AddOpenApi(options =>
{
    options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_1;
    options.AddSchemaTransformer<IntIsNoStringSchemaTransformer>();
    options.AddSchemaTransformer<NonNullableRequiredSchemaTransformer>();
    options.AddDocumentTransformer<EnumSchemaDocumentTransformer>();
});

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
/*
builder.Services.AddSwaggerGen(c =>
{
    c.SupportNonNullableReferenceTypes();
    c.UseAllOfToExtendReferenceSchemas();
    c.SchemaFilter<RequireNonNullablePropertiesSchemaFilter>();
    c.SchemaFilter<EnumVarNamesSchemaFilter>();
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WorkoutTrackerApi", Version = "v1" });
});
*/

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

//Originally from https://www.codemag.com/Article/2105051/Implementing-JWT-Authentication-in-ASP.NET-Core-5 .
//See also https://github.com/joydipkanjilal/jwt-aspnetcore/tree/master/jwt-aspnetcore for differences between the 
//article's code and the code they implemented
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseSerilogRequestLogging();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var serviceScope = app.Services.CreateScope())
{
    var context = serviceScope.ServiceProvider.GetRequiredService<WorkoutsContext>();
    context.Database.Migrate();
    context.EnsureSeedData();
}

app.Run();

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
        containerBuilder.RegisterType<Repository<RefreshToken>>().As<IRepository<RefreshToken>>();

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

/*
public class RequireNonNullablePropertiesSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema.Properties == null) return;

        var notNullableProperties = schema.Properties
            .Where(x => !x.Value.Nullable && !schema.Required.Contains(x.Key))
            .ToList();

        foreach (var property in notNullableProperties)
        {
            schema.Required.Add(property.Key);
        }

    }

}

public class EnumVarNamesSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (!context.Type.IsEnum) return;

        var names = Enum.GetNames(context.Type);
        schema.Extensions["x-enum-varnames"] = new OpenApiArray()
            .Concat(names.Select(n => new OpenApiString(n)))
            .Cast<IOpenApiAny>()
            .Aggregate(new OpenApiArray(), (arr, item) => { arr.Add(item); return arr; });
    }
}
*/

// IntIsNoStringSchemaTransformer.cs

public class IntIsNoStringSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(
        OpenApiSchema schema,
        OpenApiSchemaTransformerContext context,
        CancellationToken cancellationToken)
    {
        if (schema.Format == "int16" || schema.Format == "int32" || schema.Format == "int64" || schema.Format == "uint8" || schema.Format == "uint16" || schema.Format == "uint32" || schema.Format == "uint64")
        {
            schema.Type = JsonSchemaType.Integer;
            schema.Pattern = null;
        }

        if (schema.Format == "float" || schema.Format == "double")
        {
            schema.Type = JsonSchemaType.Number;
            schema.Pattern = null;
        }

        return Task.CompletedTask;
    }
}

public class NonNullableRequiredSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(
        OpenApiSchema schema,
        OpenApiSchemaTransformerContext context,
        CancellationToken cancellationToken)
    {
        if (schema.Properties is null) return Task.CompletedTask;

        foreach (var (propertyName, propertySchema) in schema.Properties)
        {
            // Type is a nullable flags enum — a null Type means no type constraint (skip)
            // A nullable property has JsonSchemaType.Null bit set
            if (propertySchema is not OpenApiSchema concreteSchema) continue;

            var isNullable = concreteSchema.Type.HasValue
                && (concreteSchema.Type.Value & JsonSchemaType.Null) == JsonSchemaType.Null;

            if (!isNullable && !(schema.Required?.Contains(propertyName) ?? false))
            {
                schema.Required ??= new HashSet<string>();
                schema.Required.Add(propertyName);
            }
        }

        return Task.CompletedTask;
    }
}


public class EnumSchemaDocumentTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        if (document.Components?.Schemas is null) return Task.CompletedTask;

        foreach (var (key, schema) in document.Components.Schemas)
        {

            if (schema is not OpenApiSchema openApiSchema) continue;

            // Fix nullable oneOf on all schemas, not just enums
            FixNullableOneOfs(openApiSchema);

            if (openApiSchema.Type is null) continue;
            if ((openApiSchema.Type & JsonSchemaType.Integer) == 0) continue;

            // Try to find the matching enum type by name
            var enumType = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(a => a.GetTypes())
                .FirstOrDefault(t => t.IsEnum && t.Name == key);

            if (enumType is null) continue;

            var names = Enum.GetNames(enumType);
            var values = Enum.GetValues(enumType).Cast<int>().ToArray();

            openApiSchema.Enum = values
                .Select(v => (JsonNode)JsonValue.Create(v)!)
                .ToList();

            openApiSchema.Extensions ??= new Dictionary<string, IOpenApiExtension>();
            openApiSchema.Extensions["x-enum-varnames"] = new JsonNodeExtension(
                new JsonArray(names.Select(n => (JsonNode)JsonValue.Create(n)!).ToArray())
            );
        }

        return Task.CompletedTask;
    }

    private static void FixNullableOneOfs(OpenApiSchema schema)
    {
        if (schema.Properties is null) return;

        foreach (var (propName, propSchema) in schema.Properties)
        {
            if (propSchema is not OpenApiSchema prop) continue;
            FixNullableOneOfs(prop);

            if (prop.OneOf is null) continue;

            var hasNullableEntry = prop.OneOf.Any(e =>
                e is OpenApiSchema s &&
                (s.UnrecognizedKeywords?.ContainsKey("nullable") ?? false));

            if (!hasNullableEntry) continue;

            // Rebuild the oneOf, replacing the nullable entry with a proper null type
            var newOneOf = prop.OneOf
                .Select(e =>
                {
                    if (e is OpenApiSchema s &&
                        (s.UnrecognizedKeywords?.ContainsKey("nullable") ?? false))
                    {
                        return (IOpenApiSchema)new OpenApiSchema { Type = JsonSchemaType.Null };
                    }
                    return e;
                })
                .ToList();

            prop.OneOf = newOneOf;
        }
    }
}





