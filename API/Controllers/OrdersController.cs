using System;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Entities.OrderAggregates;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class OrdersController(ICartService cartService, IUnitOfWork unit): BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto createOrderDto)
    {
        var email  = User.GetEmail();

        var cart = await cartService.GetCartAsync(createOrderDto.CartId);

        if(cart == null)
            return BadRequest("Cart not found");

        if(cart.PaymentIntentId == null)
            return BadRequest("No payment intent for this order");

        var items =  new List<OrderItem>();

        foreach(var item in cart.Items)
        {
            var product = await unit.Repository<Core.Entities.Product>().GetByIdAsync(item.ProductId);
            if(product == null)
                return BadRequest($"Problem with thw order");

            var itemOrdered = new ProductItemOrdered
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                PictureUrl = item.PictureUrl
            };

            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = product.Price,
                Quantity = item.Quantity
            };

            items.Add(orderItem);
        }


        var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync(createOrderDto.DeliveryMethodId);
        if(deliveryMethod == null)
            return BadRequest("no Delivery method selected");
        
        var order = new Order
        {
            BuyerEmail = email,
            OrderItems = items,
            ShippingAddress = createOrderDto.ShippingAddress,
            DeliveryMethod = deliveryMethod,
            Subtotal = items.Sum(item => item.Price * item.Quantity),
            Discount = createOrderDto.Discount,
            PaymentIntentId = cart.PaymentIntentId,
            PaymentSummary = createOrderDto.PaymentSummary
        };

        unit.Repository<Order>().Add(order);

        if(await unit.Complete())
        {
            return order;
        }
        return BadRequest("Problem creating order");
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrdersForUser()
    {
        var email = User.GetEmail();
        var spec = new OrderSpecification(email);
        var orders = await unit.Repository<Order>().ListAsync(spec);
        
        var ordersToReturn = orders.Select(order => order.ToDto()).ToList();

        return Ok(ordersToReturn);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrderByIdForUser(int id)
    {
        var email = User.GetEmail();
        var spec = new OrderSpecification(email, id);
        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);
        if(order == null)
            return NotFound();
        return Ok(order.ToDto());
    }
}
