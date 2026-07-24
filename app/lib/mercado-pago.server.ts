import MercadoPagoConfig, { Payment, Preference } from "mercadopago";

type MercadoPagoServices = {
  client: MercadoPagoConfig;
  payment: Payment;
  preference: Preference;
};

let services: MercadoPagoServices | undefined;

function getAccessToken(): string {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    throw new Error(
      "MERCADO_PAGO_ACCESS_TOKEN não foi configurado no ambiente do servidor.",
    );
  }

  return accessToken;
}

/**
 * Retorna uma única instância dos clientes do Mercado Pago por processo.
 * Este arquivo deve ser importado apenas por rotas e componentes do servidor.
 */
export function getMercadoPago(): MercadoPagoServices {
  if (typeof window !== "undefined") {
    throw new Error("O SDK do Mercado Pago não pode ser usado no navegador.");
  }

  if (!services) {
    const client = new MercadoPagoConfig({
      accessToken: getAccessToken(),
      options: { timeout: 10_000 },
    });

    services = {
      client,
      payment: new Payment(client),
      preference: new Preference(client),
    };
  }

  return services;
}

