using System;
using System.Text;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.RequestHelpers;

[AttributeUsage(AttributeTargets.All)]
public class CacheAttribute(int timeToLiveSec) : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
         var cacheService = context.HttpContext.RequestServices.GetRequiredService<IResponseCacheService>();
         var cachedKey = GenerateCacheKeyFromRequest(context.HttpContext.Request).ToString();
         var cachedResponse=await cacheService.GetCachedResponseAsync(cachedKey!);

        if (!string.IsNullOrEmpty(cachedResponse))
        {
            var contentResult = new ContentResult
            {
                Content = cachedResponse,
                ContentType = "application/json",
                StatusCode=200
            };
            context.Result=contentResult;

            return;
        }

        var executedContext =await next();
        if(executedContext.Result is OkObjectResult okObjectResult)
        {
            if(okObjectResult.Value != null)
            {
                await cacheService.CacheResponseAsync(cachedKey!, okObjectResult.Value, TimeSpan.FromSeconds(timeToLiveSec));

            }
        }
    }

    private object GenerateCacheKeyFromRequest(HttpRequest request)
    {
        var keyBuilder =new StringBuilder();
        keyBuilder.Append($"{request.Path}");

        foreach(var (key, value) in request.Query.OrderBy(x => x.Key))
        {
            keyBuilder.Append($"|{key}-{value}");
        }
        return keyBuilder.ToString();
    }
}
