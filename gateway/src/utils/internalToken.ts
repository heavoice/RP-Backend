export const getInternalServiceToken = (): string => {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token) {
    throw new Error("INTERNAL_SERVICE_TOKEN must be configured");
  }

  return token;
};
