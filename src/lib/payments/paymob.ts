const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

export interface PaymobAuthResponse {
  token: string;
}

export interface PaymobOrderResponse {
  id: number;
}

export interface PaymobPaymentKeyResponse {
  token: string;
}

export class PaymobClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async authenticate(): Promise<string> {
    const response = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: this.apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Paymob authentication failed: ${await response.text()}`);
    }

    const data: PaymobAuthResponse = await response.json();
    return data.token;
  }

  async createOrder(token: string, amount: number, appointmentId: string): Promise<number> {
    const response = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: "false",
        amount_cents: Math.round(amount * 100),
        currency: "EGP",
        merchant_order_id: appointmentId, // Map with appointmentId
        items: [
          {
            name: "Consultation Fee",
            amount_cents: Math.round(amount * 100),
            description: "Consultation Fee",
            quantity: 1,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Paymob order creation failed: ${await response.text()}`);
    }

    const data: PaymobOrderResponse = await response.json();
    return data.id;
  }

  async generatePaymentKey(
    token: string,
    orderId: number,
    amount: number,
    integrationId: string,
    billingData: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
    },
    redirectUrl?: string
  ): Promise<string> {
    const response = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          ...billingData,
          apartment: "NA",
          floor: "NA",
          street: "NA",
          building: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EG",
          state: "Cairo",
        },
        currency: "EGP",
        integration_id: integrationId,
        redirection_url: redirectUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Paymob payment key generation failed: ${await response.text()}`);
    }

    const data: PaymobPaymentKeyResponse = await response.json();
    return data.token;
  }
}
