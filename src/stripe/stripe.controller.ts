import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request as ExpressRequest } from 'express';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { AuthGuard } from '@nestjs/passport';
@Controller('stripe')
@UseGuards(AuthGuard('jwt'))
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Request() req: ExpressRequest,
    @Body() body: { amount: number }
  ) {
    const user = req.user as JwtUser;
    const customer = await this.stripeService.findOrCreateCustomer(user.userId, user.email);

    return this.stripeService.createPaymentIntent(body.amount, customer.id);
  }
  @Post('create-setup-intent')
  async createSetupIntent(@Request() req: ExpressRequest) {
    const user = req.user as JwtUser;

    const customer = await this.stripeService.findOrCreateCustomer(user.userId, user.email);
    const setupIntent = await this.stripeService.createSetupIntentForCustomer(customer.id);

    return { client_secret: setupIntent.client_secret };
  }

}
