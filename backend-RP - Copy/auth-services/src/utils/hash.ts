import bcrypt from "bcrypt";

export const comparePassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};
