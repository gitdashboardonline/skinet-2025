import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [
    MatButton,
    RouterLink, 
  ],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.scss',
})
export class CheckoutSuccessComponent {

}
