import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";

export function BackButton({ color }: { color: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel={t("recommendation.back")}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center active:opacity-60"
    >
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M 15 5 L 8 12 L 15 19"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}
