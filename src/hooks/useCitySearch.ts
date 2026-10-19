import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchCities } from "@/services/geocoding";
import { cacheTimes } from "@/services/queryClient";
import { cityKeys } from "@/services/queryKeys";

import { useDebouncedValue } from "./useDebouncedValue";
import { useLanguage } from "./useLanguage";

export const SEARCH_DEBOUNCE_MS = 350;
export const MIN_SEARCH_LENGTH = 2;

export function useCitySearch(term: string) {
  const language = useLanguage();
  const trimmedTerm = term.trim();
  const debouncedTerm = useDebouncedValue(trimmedTerm, SEARCH_DEBOUNCE_MS);
  const enabled = debouncedTerm.length >= MIN_SEARCH_LENGTH;

  const query = useQuery({
    queryKey: cityKeys.search(debouncedTerm, language),
    queryFn: ({ signal }) => searchCities(debouncedTerm, language, signal),
    enabled,
    placeholderData: enabled ? keepPreviousData : undefined,
    ...cacheTimes.city,
  });

  const isIdle = !enabled || trimmedTerm.length < MIN_SEARCH_LENGTH;

  return {
    cities: isIdle ? undefined : query.data,
    isIdle,
    isLoading: !isIdle && query.isLoading,
    isFetching: !isIdle && query.isFetching,
    error: isIdle ? null : query.error,
    refetch: query.refetch,
  };
}
