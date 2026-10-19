import { useQuery } from "@tanstack/react-query";

import { getCity } from "@/services/geocoding";
import { cacheTimes } from "@/services/queryClient";
import { cityKeys } from "@/services/queryKeys";

import { useLanguage } from "./useLanguage";

export function useCity(id: number) {
  const language = useLanguage();

  return useQuery({
    queryKey: cityKeys.detail(id, language),
    queryFn: ({ signal }) => getCity(id, language, signal),
    ...cacheTimes.city,
  });
}
