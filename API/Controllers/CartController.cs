using System;
using Core.Entities;
using Core.Interfaces;
using Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;

namespace API.Controllers;

public class CartController(ICartService cartService):BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<ShoppingCart>> GetCartById(string id)
    {
        var cart = await cartService.GetCartAsync(id);
        return Ok(cart ?? new ShoppingCart{Id=  id});

    }

    [HttpPost]
    public async Task<ActionResult<ShoppingCart>> UpdateCart(ShoppingCart cart)
    {
        var updateCart = await cartService.SetCartAsync(cart);
        if(updateCart == null)
            return BadRequest("Problem with the cart");

        return updateCart;
    }
    [HttpDelete]
    public async Task<ActionResult> DeleteCart(string id)
    {
        var result =  await cartService.DeleteCartAsync(id);
        if(!result) 
        return BadRequest("preblem deleting cart");

        return Ok();
    }

}
