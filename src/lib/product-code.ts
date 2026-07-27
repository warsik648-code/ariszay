/** Formats a display product serial, e.g. AZ-ISL-XRA-01 */
export function getProductCode(gameSlug: string, tier: string): string {
  return `AZ-${gameSlug.slice(0, 3).toUpperCase()}-${tier.slice(0, 3).toUpperCase()}-01`;
}
