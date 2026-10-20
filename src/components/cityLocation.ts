import type { City } from "@/types/city";

export function cityLocation({ region, country }: Pick<City, "region" | "country">): string {
  return [region, country].filter(Boolean).join(", ");
}
