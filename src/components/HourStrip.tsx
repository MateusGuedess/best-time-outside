import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { tv } from "tailwind-variants/lite";

import { Text } from "@/components/ui/Text";
import { useLanguage } from "@/hooks/useLanguage";
import { formatHour } from "@/i18n/format";
import { isWithin } from "@/recommendation/localTime";
import { weatherKind } from "@/recommendation/weatherKind";
import type { PeriodRecommendation, ScoredHour } from "@/types/recommendation";

import { HourDetails } from "./HourDetails";
import { WeatherIcon } from "./WeatherIcon";

const ITEM_WIDTH = 56;
const SIDE_PADDING = 16;

const hourLabel = tv({
  base: "rounded-full px-2 py-0.5",
  variants: { highlighted: { true: "bg-accent" } },
});

type HourStripProps = Pick<PeriodRecommendation, "candidates" | "from" | "to">;

export function HourStrip({ candidates, from, to }: HourStripProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const [selected, setSelected] = useState<ScoredHour | null>(null);
  const firstInWindow = Math.max(
    0,
    candidates.findIndex(({ time }) => isWithin(time, from, to)),
  );

  const scrollToWindow = () => {
    scrollRef.current?.scrollTo({
      x: Math.max(0, firstInWindow - 1) * ITEM_WIDTH,
      animated: false,
    });
  };

  return (
    <>
      <ScrollView
        ref={scrollRef}
        horizontal
        testID="hour-strip"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
        onContentSizeChange={scrollToWindow}
      >
        {candidates.map((hour) => {
          const highlighted = isWithin(hour.time, from, to);
          const label = formatHour(hour.time, language);
          return (
            <Pressable
              key={`${hour.time.date}-${hour.time.hour}`}
              onPress={() => setSelected(hour)}
              accessibilityRole="button"
              accessibilityHint={t("hourDetails.hint")}
              accessibilityLabel={
                highlighted ? t("recommendation.inWindow", { hour: label }) : label
              }
              className="items-center gap-2 active:opacity-60"
              style={{ width: ITEM_WIDTH }}
            >
              <WeatherIcon kind={weatherKind(hour.weatherCode)} period={hour.period} />
              <View className={hourLabel({ highlighted })}>
                <Text variant="caption">{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <HourDetails
        hour={selected}
        inWindow={selected !== null && isWithin(selected.time, from, to)}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
