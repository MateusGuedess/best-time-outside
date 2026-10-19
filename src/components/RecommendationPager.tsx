import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  FlatList,
  useColorScheme,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePalette } from "@/theme/PeriodTheme";
import type { PeriodRecommendation, Recommendation } from "@/types/recommendation";

import { BackButton } from "./BackButton";
import { PeriodPage } from "./PeriodPage";

type RecommendationPagerProps = {
  recommendation: Recommendation;
  cityName: string;
  cityTimeNote: string | null;
};

export function RecommendationPager({
  recommendation,
  cityName,
  cityTimeNote,
}: RecommendationPagerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const pages = [recommendation.day, recommendation.night].filter((page) => page !== null);
  const initialPage = Math.max(
    0,
    pages.findIndex(({ period }) => period === recommendation.best),
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const currentPeriod = pages[currentPage]?.period ?? "day";
  const colors = usePalette(currentPeriod);
  const isDarkPage = scheme === "dark" || currentPeriod === "night";

  const onPageChange = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrentPage(Math.round(nativeEvent.contentOffset.x / width));
  };

  const renderPage = ({ item, index }: { item: PeriodRecommendation; index: number }) => (
    <PeriodPage
      recommendation={item}
      cityName={cityName}
      cityTimeNote={cityTimeNote}
      isBest={pages.length > 1 && item.period === recommendation.best}
      isBadDay={recommendation.isBadDay}
      page={index}
      pageCount={pages.length}
    />
  );

  return (
    <View className="flex-1">
      <StatusBar style={isDarkPage ? "light" : "dark"} />
      <FlatList
        horizontal
        pagingEnabled
        data={pages}
        keyExtractor={({ period }) => period}
        renderItem={renderPage}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialScrollIndex={initialPage}
        onMomentumScrollEnd={onPageChange}
        showsHorizontalScrollIndicator={false}
      />
      <View className="absolute left-2" style={{ top: insets.top + 4 }}>
        <BackButton color={colors.text} />
      </View>
    </View>
  );
}
