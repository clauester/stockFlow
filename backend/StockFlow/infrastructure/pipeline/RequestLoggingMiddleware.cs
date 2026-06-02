using System.Diagnostics;

namespace StockFlow.infrastructure.pipeline;

// middleware para registrar en el log cada request que llega a la api
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    private static readonly string[] _rutasExcluidas = ["/health", "/swagger", "/favicon"];

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var ruta = context.Request.Path.Value ?? "/";

        if (_rutasExcluidas.Any(r => ruta.StartsWith(r, StringComparison.OrdinalIgnoreCase)))
        {
            await _next(context);
            return;
        }

        var sw = Stopwatch.StartNew();
        await _next(context);
        sw.Stop();

        var metodo     = context.Request.Method;
        var query      = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : string.Empty;
        var ip         = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                         ?? context.Connection.RemoteIpAddress?.ToString()
                         ?? "desconocida";
        var statusCode = context.Response.StatusCode;
        var ms         = sw.ElapsedMilliseconds;

        _logger.LogInformation(
            "HTTP {Metodo} {Ruta}{Query} | IP: {Ip} | {StatusCode} | {Ms}ms",
            metodo, ruta, query, ip, statusCode, ms);
    }
}
