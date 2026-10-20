import { useTranslation } from "react-i18next";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PageDots } from "@/components/ui/PageDots";
import { PaperTexture } from "@/components/ui/PaperTexture";
import { Text } from "@/components/ui/Text";
import { VerticalText } from "@/components/ui/VerticalText";
import { useDateLocale } from "@/hooks/useDateLocale";
import { useLanguage } from "@/hooks/useLanguage";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { formatDate, formatHour, formatTime, toDisplayTemperature } from "@/i18n/format";
import { sceneFor } from "@/recommendation/weatherKind";
import { PeriodTheme } from "@/theme/PeriodTheme";
import type { PeriodRecommendation } from "@/types/recommendation";

import { HourStrip } from "./HourStrip";
import { WeatherScene } from "./WeatherScene";

type PeriodPageProps = {
  recommendation: PeriodRecommendation;
  cityName: string;
  cityLocation: string;
  cityTimeNote: string | null;
  isBest: boolean;
  isBadDay: boolean;
  page: number;
  pageCount: number;
};

export function PeriodPage({
  recommendation,
  cityName,
  cityLocation,
  cityTimeNote,
  isBest,
  isBadDay,
  page,
  pageCount,
}: PeriodPageProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const dateLocale = useDateLocale();
  const unit = useTemperatureUnit();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { period, rating, factors, hours, from, to, sunset, suggestions, isTomorrow } =
    recommendation;

  const windowText =
    hours.length === 1
      ? t("recommendation.at", { hour: formatHour(from, language) })
      : t("recommendation.between", {
          from: formatHour(from, language),
          to: formatHour(to, language),
        });
  const periodName = t(`recommendation.period.${period}`);
  const heading = isTomorrow ? `${t("recommendation.tomorrow")} · ${periodName}` : periodName;
  const reasons = [
    t(`factors.temperature.${factors.temperature}`),
    t(`factors.rain.${factors.rain}`),
    t(`factors.wind.${factors.wind}`),
  ];
  const warnings = [
    factors.storm && t("factors.storm"),
    factors.uvAlert && t("factors.uvAlert"),
  ].filter((warning) => typeof warning === "string");

  return (
    <PeriodTheme period={period} className="flex-1 bg-background">
      <ScrollView
        style={{ width }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            minHeight: height,
            paddingTop: insets.top + 44,
            paddingBottom: insets.bottom + 8,
          }}
          className="gap-4"
        >
          <View className="flex-row items-start justify-between px-6">
            <View className="flex-1 gap-1">
              <View className="flex-row flex-wrap items-baseline gap-x-3">
                <Text variant="label" accessibilityRole="header">
                  {heading}
                </Text>
                {isBest && <Text variant="caption">★ {t("recommendation.best")}</Text>}
              </View>
              <Text variant="caption">{formatDate(from.date, dateLocale)}</Text>
              <View
                className="flex-row items-start pt-1"
                accessible
                accessibilityLabel={t("recommendation.feelsLike", {
                  value: toDisplayTemperature(recommendation.feelsLike, unit),
                  unit: t(`units.${unit}`),
                })}
              >
                <Text variant="display">
                  {toDisplayTemperature(recommendation.feelsLike, unit)}
                </Text>
                <View className="pt-3">
                  <Text variant="unit">°</Text>
                  <Text variant="unit">{unit === "celsius" ? "C" : "F"}</Text>
                </View>
              </View>
            </View>
            <View className="pt-8">
              <VerticalText>{t(`rating.${rating}`)}</VerticalText>
            </View>
          </View>

          <View className="gap-3 px-6">
            {isBadDay && <Text variant="body">{t("recommendation.badDay")}</Text>}
            <View className="flex-row gap-6">
              <View className="flex-1 gap-0.5">
                <Text variant="label">{t("recommendation.why")}</Text>
                {reasons.map((reason) => (
                  <Text key={reason} variant="caption">
                    {reason}
                  </Text>
                ))}
                {warnings.map((warning) => (
                  <Text key={warning} variant="body">
                    {warning}
                  </Text>
                ))}
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="label">{t("recommendation.ideas")}</Text>
                {suggestions.map((key) => (
                  <Text key={key} variant="caption">
                    {t(key)}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <WeatherScene scene={sceneFor(recommendation)} width={width} />

          <View className="items-center gap-1 px-6">
            <Text variant="heading" className="text-center">
              {windowText}
            </Text>
            {sunset && (
              <Text variant="caption">
                {t("recommendation.sunset", { time: formatTime(sunset, language) })}
              </Text>
            )}
          </View>

          <View className="items-center gap-1">
            <Text variant="label">{cityName}</Text>
            {cityLocation !== "" && <Text variant="caption">{cityLocation}</Text>}
            {cityTimeNote && <Text variant="caption">{cityTimeNote}</Text>}
          </View>

          <HourStrip {...recommendation} />

          <PageDots
            count={pageCount}
            current={page}
            label={t("recommendation.page", { current: page + 1, total: pageCount })}
          />
        </View>
        <PaperTexture />
      </ScrollView>
    </PeriodTheme>
  );
}
