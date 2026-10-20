import { useTranslation } from "react-i18next";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tv } from "tailwind-variants/lite";

import { PaperTexture } from "@/components/ui/PaperTexture";
import { Text } from "@/components/ui/Text";
import { useLanguage } from "@/hooks/useLanguage";
import { useTemperatureUnit } from "@/hooks/useTemperatureUnit";
import { useWindUnit } from "@/hooks/useWindUnit";
import { formatHour, toDisplayTemperature, toDisplayWind } from "@/i18n/format";
import { rate } from "@/recommendation/describe";
import { explainHour, type WeightedFactor } from "@/recommendation/score";
import { PeriodTheme } from "@/theme/PeriodTheme";
import type { ScoredHour } from "@/types/recommendation";

const GOOD_GRADE = 0.75;
const FAIR_GRADE = 0.4;

type Verdict = "good" | "fair" | "bad";

function verdictOf(grade: number): Verdict {
  if (grade >= GOOD_GRADE) return "good";
  if (grade >= FAIR_GRADE) return "fair";
  return "bad";
}

const MARKS: Record<Verdict, string> = { good: "✓", fair: "~", bad: "✕" };

const row = tv({
  base: "flex-row items-baseline justify-between gap-3 py-1.5",
  variants: { emphasis: { true: "border-t border-muted/30 pt-3" } },
});

type CheckRowProps = {
  label: string;
  value: string;
  note?: string;
  verdict?: Verdict;
  emphasis?: boolean;
};

function CheckRow({ label, value, note, verdict, emphasis = false }: CheckRowProps) {
  return (
    <View
      accessible
      accessibilityLabel={[label, value, note].filter(Boolean).join(", ")}
      className={row({ emphasis })}
    >
      <View className="flex-1 flex-row items-baseline gap-2">
        <Text variant="caption" className="w-4 text-center">
          {verdict ? MARKS[verdict] : ""}
        </Text>
        <Text variant="body">{label}</Text>
      </View>
      <View className="items-end">
        <Text variant="body">{value}</Text>
        {note && <Text variant="caption">{note}</Text>}
      </View>
    </View>
  );
}

function percent(value: number): number {
  return Math.round(value * 100);
}

type HourDetailsProps = {
  hour: ScoredHour | null;
  inWindow: boolean;
  onClose: () => void;
};

export function HourDetails({ hour, inWindow, onClose }: HourDetailsProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const temperatureUnit = useTemperatureUnit();
  const windUnit = useWindUnit();
  const insets = useSafeAreaInsets();

  if (!hour) return null;

  const breakdown = explainHour(hour, hour.period);
  const score = Math.round(breakdown.score);
  const weighted = ({ grade, weight }: WeightedFactor) =>
    weight === 0
      ? t("hourDetails.notCounted")
      : t("hourDetails.weighted", { grade: percent(grade), weight: percent(weight) });
  const multiplier = (factor: number) => t("hourDetails.multiplier", { factor: factor.toFixed(2) });
  const wind = `${toDisplayWind(breakdown.wind.value, windUnit)} ${t(`units.${windUnit}`)}`;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("hourDetails.close")}
          className="absolute inset-0 bg-black/40"
        />
        <PeriodTheme period={hour.period}>
          <View
            accessibilityViewIsModal
            className="overflow-hidden rounded-t-3xl bg-background px-6 pt-6"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row items-start justify-between">
              <View className="gap-1">
                <Text variant="label" accessibilityRole="header">
                  {`${formatHour(hour.time, language)} · ${t(`rating.${rate(score)}`)}`}
                </Text>
                <Text variant="heading">{t("hourDetails.score", { score })}</Text>
                <Text variant="caption">
                  {t(inWindow ? "hourDetails.inWindow" : "hourDetails.outWindow")}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t("hourDetails.close")}
                hitSlop={12}
                className="h-11 w-11 items-center justify-center active:opacity-60"
              >
                <Text variant="title">✕</Text>
              </Pressable>
            </View>

            <View className="pt-4">
              <CheckRow
                label={t("hourDetails.feelsLike")}
                value={`${toDisplayTemperature(breakdown.temperature.value, temperatureUnit)}°`}
                note={weighted(breakdown.temperature)}
                verdict={verdictOf(breakdown.temperature.grade)}
              />
              <CheckRow
                label={t("hourDetails.wind")}
                value={wind}
                note={weighted(breakdown.wind)}
                verdict={verdictOf(breakdown.wind.grade)}
              />
              <CheckRow
                label={t("hourDetails.uv")}
                value={String(Math.round(breakdown.uv.value))}
                note={weighted(breakdown.uv)}
                verdict={breakdown.uv.weight === 0 ? undefined : verdictOf(breakdown.uv.grade)}
              />
              <CheckRow
                label={t("hourDetails.comfort")}
                value={String(percent(breakdown.comfort))}
                emphasis
              />
              <CheckRow
                label={t("hourDetails.rain")}
                value={`${Math.round(breakdown.rain.value)}%`}
                note={multiplier(breakdown.rain.factor)}
                verdict={verdictOf(breakdown.rain.factor)}
              />
              <CheckRow
                label={t("hourDetails.strongWind")}
                value={wind}
                note={multiplier(breakdown.strongWind.factor)}
                verdict={verdictOf(breakdown.strongWind.factor)}
              />
              <CheckRow
                label={t("hourDetails.storm")}
                value={t(breakdown.storm ? "hourDetails.stormYes" : "hourDetails.stormNo")}
                verdict={breakdown.storm ? "bad" : "good"}
              />
              <CheckRow label={t("hourDetails.final")} value={String(score)} emphasis />
            </View>

            <Text variant="caption" className="pt-3">
              {t("hourDetails.formula")}
            </Text>
            <PaperTexture />
          </View>
        </PeriodTheme>
      </View>
    </Modal>
  );
}
