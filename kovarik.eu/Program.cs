using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc.Razor;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages()
    .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
    .AddDataAnnotationsLocalization();

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

var supportedCultures = new[]
{
    new CultureInfo("cs"),
    new CultureInfo("en")
};

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new RequestCulture("cs");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    // Order: query-string -> cookie -> Accept-Language header -> default (built-in defaults).
});

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

app.UseRequestLocalization();

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

// Language switch endpoint. Stores the chosen culture in a cookie and redirects back.
app.MapGet("/set-language", (HttpContext ctx, string culture, string? returnUrl) =>
{
    var allowed = new[] { "cs", "en" };
    if (!allowed.Contains(culture, StringComparer.OrdinalIgnoreCase))
    {
        culture = "cs";
    }

    ctx.Response.Cookies.Append(
        CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
        new CookieOptions
        {
            Expires = DateTimeOffset.UtcNow.AddYears(1),
            IsEssential = true,
            HttpOnly = false,
            SameSite = SameSiteMode.Lax,
            Secure = ctx.Request.IsHttps
        });

    // Only allow local return URLs to avoid open-redirect.
    if (string.IsNullOrEmpty(returnUrl) || !Uri.IsWellFormedUriString(returnUrl, UriKind.Relative))
    {
        returnUrl = "/";
    }

    return Results.LocalRedirect(returnUrl);
});

app.MapRazorPages()
   .WithStaticAssets();

app.Run();
