export const getPaymentStatus = (
  transactionStatus: string,
  fraudStatus?: string,
): "PENDING" | "PAID" | "FAILED" => {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "accept" ? "PAID" : "PENDING";

    case "settlement":
      return "PAID";

    case "cancel":
    case "deny":
    case "expire":
      return "FAILED";

    default:
      return "PENDING";
  }
};
