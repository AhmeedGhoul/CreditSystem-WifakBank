import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createPaymentIntent(amount: number, customerId: string, currency = 'usd') {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      payment_method_types: ['card'],
    });
  }
  async createSetupIntent() {
    return this.stripe.setupIntents.create();
  }
  async createStripeCustomer(userId: number, email: string) {
    return this.stripe.customers.create({
      metadata: { userId: userId.toString() },
      email,
    });
  }

  async createSetupIntentForCustomer(customerId: string) {
    return this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  }

  async findOrCreateCustomer(userId: number, email: string) {
    const customers = await this.stripe.customers.list({ email, limit: 1 });

    if (customers.data.length > 0) return customers.data[0];
    return this.createStripeCustomer(userId, email);
  }
  async getCustomerCards(customerId: string) {
    const methods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    return methods.data.map(method => ({
      brand: method.card?.brand,
      last4: method.card?.last4,
      expMonth: method.card?.exp_month,
      expYear: method.card?.exp_year
    }));
  }

  async getCustomerPayments(customerId: string) {
    const charges = await this.stripe.charges.list({
      customer: customerId,
      limit: 10
    });

    return charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      date: new Date(charge.created * 1000).toISOString().split('T')[0],
      status: charge.status
    }));
  }
  async listPaymentMethods(customerId: string) {
    const res = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return res.data;
  }

}
