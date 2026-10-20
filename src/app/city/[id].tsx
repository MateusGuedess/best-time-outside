import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { cityLocation } from "@/components/cityLocation";
import { RecommendationPager } from "@/components/RecommendationPager";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PaperTexture } from "@/components/ui/PaperTexture";
import { Text } from "@/components/ui/Text";
import { useCity } from "@/hooks/useCity";
import { useForecast } from "@/hooks/useForecast";
import { useLanguage } from "@/hooks/useLanguage";
import { useNow } from "@/hooks/useNow";
import { errorMessageKey } from "@/i18n/errorMessageKey";
import { formatTime } from "@/i18n/format";
import { cityNow } from "@/recommendation/localTime";
import { recommend } from "@/recommendation/recommend";
import { HttpError } from "@/services/http";
import { usePeriodColors } from "@/theme/PeriodTheme";
import type { City } from "@/types/city";
import type { Forecast } from "@/types/forecast";

function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === 400;
}

function deviceUtcOffsetSeconds(epochMs: number): number {
  return -new Date(epochMs).getTimezoneOffset() * 60;
}

function CityStatus({ cityName, children }: { cityName?: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const colors = usePeriodColors();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top + 4 }}>
      <View className="px-2">
        <BackButton color={colors.text} />
      </View>
      {cityName && (
        <Text variant="label" accessibilityRole="header" className="px-6 pt-4">
          {cityName}
        </Text>
      )}
      {children}
      <PaperTexture />
    </View>
  );
}

function CityForecast({ city, forecast }: { city: City; forecast: Forecast }) {
  const { t } = useTranslation();
  const language = useLanguage();
  const epochMs = useNow();
  const now = cityNow(epochMs, forecast.utcOffsetSeconds);
  const recommendation = useMemo(
    () => recommend(forecast, { date: now.date, hour: now.hour, minute: 0 }),
    [forecast, now.date, now.hour],
  );
  const cityName = city.name;
  const cityTimeNote =
    forecast.utcOffsetSeconds === deviceUtcOffsetSeconds(epochMs)
      ? null
      : t("recommendation.cityTime", { city: cityName, time: formatTime(now, language) });

  if (!recommendation.day && !recommendation.night) {
    return (
      <CityStatus cityName={cityName}>
        <EmptyState message={t("recommendation.empty")} />
      </CityStatus>
    );
  }

  return (
    <RecommendationPager
      recommendation={recommendation}
      cityName={cityName}
      cityLocation={cityLocation(city)}
      cityTimeNote={cityTimeNote}
    />
  );
}

export default function CityScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cityId = Number(id);
  const isValidId = Number.isInteger(cityId) && cityId > 0;
  const city = useCity(cityId, { enabled: isValidId });
  const forecast = useForecast(
    city.data ? { latitude: city.data.latitude, longitude: city.data.longitude } : undefined,
  );
  const cityName = city.data?.name;

  const renderContent = () => {
    if (!isValidId || isNotFound(city.error)) {
      return (
        <CityStatus>
          <EmptyState message={t("city.notFound")} />
        </CityStatus>
      );
    }
    const error = city.error ?? forecast.error;
    if (error) {
      return (
        <CityStatus cityName={cityName}>
          <ErrorState
            message={t(errorMessageKey(error))}
            retryLabel={t("errors.retry")}
            onRetry={() => void (city.error ? city.refetch() : forecast.refetch())}
          />
        </CityStatus>
      );
    }
    if (!city.data || !forecast.data) {
      return (
        <CityStatus cityName={cityName}>
          <EmptyState message={t("city.loading")} isLoading />
        </CityStatus>
      );
    }
    return <CityForecast city={city.data} forecast={forecast.data} />;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: cityName ?? "" }} />
      {renderContent()}
    </>
  );
}
