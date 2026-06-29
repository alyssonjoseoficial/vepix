const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: 'TEST-1845126564055097-062811-7ccd89bc3b8efc525636f13cfecf4331-82200493' });
const payment = new Payment(client);

async function run() {
  try {
    const mpResponse = await payment.create({
      body: {
        transaction_amount: 100.00,
        description: `Pedido na loja Teste`,
        payment_method_id: 'pix',
        payer: {
          email: 'test@test.com',
          first_name: 'Teste',
          last_name: 'Silva',
        },
        notification_url: 'http://localhost:3000/api/webhooks',
      },
      requestOptions: {
        idempotencyKey: Math.random().toString(36).substring(7),
      }
    });
    console.log("Success:", mpResponse.id);
  } catch (error) {
    console.error("Error cause:", error.cause || error);
  }
}

run();
