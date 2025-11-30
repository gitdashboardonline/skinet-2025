import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmationToken } from '@stripe/stripe-js';

@Pipe({
  name: 'card'
})
export class CardPipe implements PipeTransform {

  transform(value?: ConfirmationToken['payment_method_preview']['card'], ...args: unknown[]): unknown {
    if(value?.brand && 
      value.last4 && 
      value.exp_month&& 
      value.exp_year)
      {
        return `${value.brand.toUpperCase()} **** **** **** ${value.last4}, Expires ${value.exp_month}/${value.exp_year}`;
      }
      else{
        return 'Unknown card details';
      }
  }

}
