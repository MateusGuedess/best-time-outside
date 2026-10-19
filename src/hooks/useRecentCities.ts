import { useCallback, useEffect, useState } from "react";

import { addRecentCity, loadRecentCities, saveRecentCities } from "@/services/recentCities";
import type { City } from "@/types/city";

export function useRecentCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    loadRecentCities().then((stored) => {
      if (!isActive) return;
      setCities((added) => added.reduceRight(addRecentCity, stored));
      setIsLoaded(true);
    });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) saveRecentCities(cities);
  }, [cities, isLoaded]);

  const add = useCallback((city: City) => {
    setCities((current) => addRecentCity(current, city));
  }, []);

  return { cities, isLoaded, add };
}
