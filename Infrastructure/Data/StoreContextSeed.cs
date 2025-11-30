using System;

namespace Infrastructure.Data;

public class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext context)
    {
        if (!context.Products.Any())
        {
            var productsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");
            var products = System.Text.Json.JsonSerializer.Deserialize<List<Core.Entities.Product>>(productsData);

            if(products == null) return;
            
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

         if (!context.DeliveryMethods.Any())
        {
            var dmData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/delivery.json");
            var methods = System.Text.Json.JsonSerializer.Deserialize<List<Core.Entities.DeliveryMethod>>(dmData);

            if(methods == null) return;
            
            context.DeliveryMethods.AddRange(methods);
            await context.SaveChangesAsync();
        }
    }
}
