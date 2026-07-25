import { PaymentMethod } from "@prisma/client";

interface SnapParameterProps {
  orderId: string;
  amount: number;
  userId: number;
  method: PaymentMethod;
}

export const buildSnapParameter = ({
  orderId,
  amount,
  userId,
  method,
}: SnapParameterProps) => {
  const parameter: any = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },

    customer_details: {
      first_name: `User-${userId}`,
    },
  };

  switch (method) {
    case PaymentMethod.BANK_TRANSFER:
      parameter.enabled_payments = [
        "bca_va",
        "bni_va",
        "bri_va",
        "permata_va",
        "other_va",
      ];
      break;

    case PaymentMethod.E_WALLET:
      parameter.enabled_payments = ["gopay", "shopeepay"];
      break;

    case PaymentMethod.CREDIT_CARD:
      parameter.enabled_payments = ["credit_card"];
      break;

    case PaymentMethod.CASH:
      parameter.enabled_payments = ["indomaret", "alfamart"];
      break;
  }

  return parameter;
};
