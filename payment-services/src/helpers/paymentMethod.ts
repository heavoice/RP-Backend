import { PaymentMethod } from "@prisma/client";

export const methodMap: Record<string, PaymentMethod> = {
  bank_transfer: PaymentMethod.BANK_TRANSFER,

  credit_card: PaymentMethod.CREDIT_CARD,

  gopay: PaymentMethod.E_WALLET,
  shopeepay: PaymentMethod.E_WALLET,
  qris: PaymentMethod.E_WALLET,

  indomaret: PaymentMethod.CASH,
  alfamart: PaymentMethod.CASH,
};
