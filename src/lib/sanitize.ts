export function sanitizeText(value: string | null | undefined): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "");
}
