# Copilot Instructions — kovarik.eu

## Project overview

Personal portfolio website for Roman Kovařík (kovarik.eu). This is a single-project ASP.NET Core Razor Pages application targeting **.NET 10** with a dark-themed, single-page-style design. The site is in **Czech language** — all user-facing text must stay in Czech.

## Build & run

```powershell
# From solution root
dotnet build
dotnet run --project kovarik.eu

# Dev server (hot reload)
dotnet watch --project kovarik.eu
```

The dev server runs at `http://localhost:5170` (or `https://localhost:7083`).

There are no tests or linters configured in this project.

## Architecture

- **Solution root** contains `www-kovarik.eu.sln` with a single project `kovarik.eu/`.
- **Razor Pages** (`Pages/`): `Index.cshtml` is the main landing page (hero, about, skills, experience, projects, contact sections all in one page). `Privacy.cshtml` and `Error.cshtml` are secondary pages.
- **Shared layout** (`Pages/Shared/_Layout.cshtml`): Defines the HTML shell, navbar, footer, and all CDN/library references (Bootstrap 5, Font Awesome, Google Fonts).
- **Static assets** (`wwwroot/`): `css/site.css` has all custom styles, `js/site.js` has all client-side behavior (scroll animations, typing effect, particle canvas, navbar effects).
- **`old_pages/`**: Archived legacy content. Do not modify.
- **`kovarik.eu/publish/`**: Build output directory. Do not modify directly.

## Key conventions

- **URL canonicalization middleware** in `Program.cs` handles: `www.` → non-www redirect, trailing slash removal, lowercase path enforcement — all via 301 redirects. Any new routes must be lowercase and without trailing slashes.
- **SEO pattern**: Each page sets `ViewData["Title"]` and `ViewData["MetaDescription"]`. The layout uses these for `<title>`, Open Graph, and Twitter Card meta tags. New pages must follow this pattern.
- **Section structure**: The layout provides a `Head` section (for page-specific `<head>` content like JSON-LD) and a `Scripts` section. Use `@section Head { }` and `@section Scripts { }` in page views.
- **CSS approach**: All custom CSS is in a single `wwwroot/css/site.css` file — no CSS preprocessor or CSS-in-JS. CSS custom properties (variables) define the color scheme.
- **Client-side JS**: All JavaScript is in a single `wwwroot/js/site.js` file — vanilla JS, no bundler or framework. Uses `IntersectionObserver` for scroll-triggered `.fade-in` animations.
- **Static asset fingerprinting**: Uses `asp-append-version="true"` tag helpers and `MapStaticAssets()` / `.WithStaticAssets()` for cache busting.
- **Client libraries**: Bootstrap 5, jQuery, jquery-validation are served from `wwwroot/lib/` (managed via LibMan or manually). Font Awesome and Google Fonts are loaded from CDN.
