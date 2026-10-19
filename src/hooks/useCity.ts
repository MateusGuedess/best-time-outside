import { useQuery } from "@tanstack/react-query";

import { getCity } from "@/services/geocoding";
import { cacheTimes } from "@/services/queryClient";
import { cityKeys } from "@/services/queryKeys";

import { useLanguage } from "./useLanguage";

export function useCity(id: number, { enabled = true }: { enabled?: boolean } = {}) {
  const language = useLanguage();

  return useQuery({
    queryKey: cityKeys.detail(id, language),
    queryFn: ({ signal }) => getCity(id, language, signal),
    enabled,
    ...cacheTimes.city,
  });
}
