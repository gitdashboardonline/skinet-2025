import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { StripeService } from '../../core/services/stripe.service';
import {
  ConfirmationToken,
  StripeAddressElement,
  StripeAddressElementChangeEvent,
  StripePaymentElement,
  StripePaymentElementChangeEvent,
} from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { AccountService } from '../../core/services/account.service';
import { firstValueFrom } from 'rxjs';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { CheckoutReviewComponent } from './checkout-review/checkout-review.component';
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatButton,
    RouterLink,
    OrderSummaryComponent,
    MatStepperModule,
    CheckoutDeliveryComponent,
    CheckoutReviewComponent,
    CurrencyPipe,
    JsonPipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  ngOnDestroy(): void {
    this.stripeService.disposeElements();
  }
  private stripeService = inject(StripeService);
  addressElements?: StripeAddressElement;
  private snackbar = inject(SnackbarService);
  saveAddress = false;
  private accountService = inject(AccountService);
  private paymentElements?: StripePaymentElement;
  cartService = inject(CartService);
  completionStatus = signal<{ address: boolean; card: boolean; delivery: boolean }>({
    address: false,
    card: false,
    delivery: false,
  });

  confirmationToken?: ConfirmationToken;
  loading = false;

  /**
   *
   */

  async ngOnInit() {
    try {
      this.addressElements = await this.stripeService.createAddressElement();
      this.addressElements.mount('#address-element');

      this.addressElements.on('change', this.handleAddressChange);

      this.paymentElements = await this.stripeService.createPaymentElement();
      this.paymentElements.mount('#payment-element');

      this.paymentElements.on('change', this.handlePaymentChange);
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }
  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    this.completionStatus.update((state) => {
      state.card = event.complete;
      return state;
    });
  };

  handleDeliveryChange(event: boolean) {
    this.completionStatus.update((state) => {
      state.delivery = event;
      return state;
    });
  }

  handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    this.completionStatus.update((state) => {
      state.address = event.complete;
      return state;
    });
  };

  async getConfirmationToken() {
    try {
      if (Object.values(this.completionStatus()).every((status) => status === true)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) throw new Error(result.error.message);
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken);
      }
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  async OnStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripeAddress();
        address && firstValueFrom(this.accountService.updateAddress(address));
      }
    }

    if (event.selectedIndex === 2) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }

    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);
        if (result.error) throw new Error(result.error.message);
        else {
          this.cartService.deleteCart();
          this.cartService.selectedDelivery.set(null);
          this.router.navigateByUrl('/checkout/success');
        }
      }
    } catch (error: any) {
      this.snackbar.error(error.message || 'Something went wrong');
      stepper.previous();
    } finally {
      this.loading = false;
    }
  }

  private async getAddressFromStripeAddress(): Promise<Address | null> {
    const result = await this.addressElements?.getValue();
    const address = result?.value.address;
    if (address) {
      return {
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        country: address.country,
        state: address.state,
        postalCode: address.postal_code,
      };
    } else return null;
  }

  onSaveAddressCheckoxChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }
}
