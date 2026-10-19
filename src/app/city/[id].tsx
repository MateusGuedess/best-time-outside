import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Text } from "@/components/ui/Text";
import { useCity } from "@/hooks/useCity";
import { errorMessageKey } from "@/i18n/errorMessageKey";
import { HttpError } from "@/services/http";

function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === 400;
}

export default function CityScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cityId = Number(id);
  const isValidId = Number.isInteger(cityId) && cityId > 0;
  const city = useCity(cityId, { enabled: isValidId });

  const renderContent = () => {
    if (!isValidId || isNotFound(city.error)) return <EmptyState message={t("city.notFound")} />;
    if (city.error) {
      return (
        <ErrorState
          message={t(errorMessageKey(city.error))}
          retryLabel={t("errors.retry")}
          onRetry={() => void city.refetch()}
        />
      );
    }
    if (!city.data) return <EmptyState message={t("city.loading")} isLoading />;
    return (
      <View className="gap-1 p-4">
        <Text variant="title" accessibilityRole="header">
          {city.data.name}
        </Text>
        <Text variant="muted">
          {[city.data.region, city.data.country].filter(Boolean).join(", ")}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: city.data?.name ?? "" }} />
      {renderContent()}
    </View>
  );
}
