export const normalizePhone = (phone: string): string =>
  phone.replace(/\D/g, "");

interface DatabaseErrorWithCode {
  code?: unknown;
}

export const isUniqueViolationError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const databaseError = error as DatabaseErrorWithCode;
  return databaseError.code === "23505";
};
