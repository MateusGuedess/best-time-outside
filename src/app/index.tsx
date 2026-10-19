import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CityListItem } from "@/components/CityListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { PaperTexture } from "@/components/ui/PaperTexture";
import { Text } from "@/components/ui/Text";
import { useCitySearch } from "@/hooks/useCitySearch";
import { useLanguage } from "@/hooks/useLanguage";
import { useRecentCities } from "@/hooks/useRecentCities";
import { errorMessageKey } from "@/i18n/errorMessageKey";
import { cityKeys } from "@/services/queryKeys";
import type { City } from "@/types/city";

function Separator() {
  return <View className="mx-4 h-px bg-muted/20" />;
}

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const language = useLanguage();
  const [term, setTerm] = useState("");
  const search = useCitySearch(term);
  const recent = useRecentCities();
  const insets = useSafeAreaInsets();

  const openCity = (city: City) => {
    queryClient.setQueryData(cityKeys.detail(city.id, language), city);
    recent.add(city);
    router.push({ pathname: "/city/[id]", params: { id: String(city.id) } });
  };

  const showRecent = search.isIdle && recent.cities.length > 0;
  const cities = showRecent ? recent.cities : (search.cities ?? []);

  const renderFeedback = () => {
    if (search.isIdle) return <EmptyState message={t("search.intro")} />;
    if (search.isSearching) return <EmptyState message={t("search.loading")} isLoading />;
    if (search.error) {
      return (
        <ErrorState
          message={t(errorMessageKey(search.error))}
          retryLabel={t("errors.retry")}
          onRetry={() => void search.refetch()}
        />
      );
    }
    return <EmptyState message={t("search.noResults", { term: term.trim() })} />;
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ title: t("search.title") }} />
      <View className="px-6 pb-2 pt-6">
        <Text variant="heading" accessibilityRole="header">
          {t("search.title")}
        </Text>
      </View>
      <View className="px-4 pb-2 pt-2">
        <Input
          value={term}
          onChangeText={setTerm}
          onClear={() => setTerm("")}
          clearLabel={t("search.clear")}
          placeholder={t("search.placeholder")}
          accessibilityLabel={t("search.placeholder")}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={cities}
        keyExtractor={(city) => String(city.id)}
        renderItem={({ item }) => <CityListItem city={item} onPress={openCity} />}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          showRecent ? (
            <Text variant="caption" className="px-4 pb-1 pt-3 uppercase">
              {t("search.recent")}
            </Text>
          ) : null
        }
        ListEmptyComponent={renderFeedback()}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
      <PaperTexture />
    </View>
  );
}
