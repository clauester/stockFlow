using System.Net;
using System.Text.Json;
using StockFlow.core.exceptions;

namespace StockFlow.infrastructure.pipeline;

// middleware para capturar errores no controlados y devolver una respuesta json uniforme
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var traceId = context.TraceIdentifier;
            _logger.LogError(ex, "Excepción no controlada | TraceId: {TraceId} | {Message}", traceId, ex.Message);
            await EscribirRespuestaError(context, ex, traceId);
        }
    }

    private static async Task EscribirRespuestaError(HttpContext context, Exception ex, string traceId)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, mensaje) = ex switch
        {
            NotFoundException           => (HttpStatusCode.NotFound, ex.Message),
            ConflictException           => (HttpStatusCode.Conflict, ex.Message),
            DomainException             => (HttpStatusCode.BadRequest, ex.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "No autorizado."),
            _                           => (HttpStatusCode.InternalServerError, "Ocurrió un error inesperado.")
        };

        context.Response.StatusCode = (int)statusCode;

        var body = new
        {
            statusCode = (int)statusCode,
            message    = mensaje,
            traceId
        };

        var json = JsonSerializer.Serialize(body, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
