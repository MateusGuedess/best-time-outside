import { skipToken, useQuery } from "@tanstack/react-query";

import { getForecast } from "@/services/forecast";
import { cacheTimes } from "@/services/queryClient";
import { forecastKeys } from "@/services/queryKeys";
import type { Coordinates } from "@/types/forecast";

export function useForecast(coords: Coordinates | undefined) {
  return useQuery({
    queryKey: coords ? forecastKeys.byCoords(coords) : forecastKeys.all,
    queryFn: coords ? ({ signal }) => getForecast(coords, signal) : skipToken,
    ...cacheTimes.forecast,
  });
}
