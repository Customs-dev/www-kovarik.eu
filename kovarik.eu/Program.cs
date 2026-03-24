var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// URL canonicalization: www → non-www, trailing slash removal, lowercase
app.Use(async (context, next) =>
{
    var request = context.Request;
    var host = request.Host;
    var path = request.Path.Value ?? "";

    string? redirectUrl = null;

    // Redirect www → non-www
    if (host.Host.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
    {
        var newHost = host.Host[4..];
        var hostString = host.Port.HasValue ? $"{newHost}:{host.Port}" : newHost;
        redirectUrl = $"{request.Scheme}://{hostString}{path}{request.QueryString}";
    }

    // Remove trailing slash (except root "/")
    if (path.Length > 1 && path.EndsWith('/'))
    {
        path = path.TrimEnd('/');
        redirectUrl = $"{request.Scheme}://{(redirectUrl != null ? new Uri(redirectUrl).Authority : host)}{path}{request.QueryString}";
    }

    // Lowercase path
    var lowerPath = path.ToLowerInvariant();
    if (path != lowerPath)
    {
        redirectUrl = $"{request.Scheme}://{(redirectUrl != null ? new Uri(redirectUrl).Authority : host)}{lowerPath}{request.QueryString}";
    }

    if (redirectUrl != null)
    {
        context.Response.StatusCode = 301;
        context.Response.Headers.Location = redirectUrl;
        return;
    }

    await next();
});

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.Run();
