import { View } from "react-native";
import { tv } from "tailwind-variants/lite";

const dot = tv({
  base: "h-1.5 rounded-full",
  variants: {
    active: { true: "w-5 bg-text", false: "w-1.5 bg-muted/50" },
  },
});

type PageDotsProps = {
  count: number;
  current: number;
  label: string;
};

export function PageDots({ count, current, label }: PageDotsProps) {
  if (count < 2) return null;
  return (
    <View accessible accessibilityLabel={label} className="flex-row justify-center gap-1.5">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} className={dot({ active: index === current })} />
      ))}
    </View>
  );
}
