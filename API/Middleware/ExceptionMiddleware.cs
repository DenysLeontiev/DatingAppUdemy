using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Exceptions;

namespace API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.StatusCode = (int)StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json"; // because this class is not inherited from ApiControler, therefore it does not know about response type conventions(string(json) type)

                ApiExceptions response = _env.IsDevelopment() ? new ApiExceptions(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString()) 
                                                    : new ApiExceptions(context.Response.StatusCode, ex.Message, "");

                JsonSerializerOptions jsonOptions = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase}; // we clarify it here,because we dont inheret from ApiController so it does not know about its conventions

                string json = JsonSerializer.Serialize(response, jsonOptions); //  from ApiExceptions to string

                await context.Response.WriteAsync(json);
            }
        }
    }
}