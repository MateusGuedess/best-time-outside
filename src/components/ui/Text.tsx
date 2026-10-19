import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants/lite";

const text = tv({
  variants: {
    variant: {
      display: "font-jost-thin text-[84px] leading-[90px] text-text",
      unit: "font-jost-light text-2xl text-text",
      heading: "font-jost-light text-2xl text-text",
      label: "font-jost-medium text-xs uppercase tracking-[4px] text-text",
      title: "font-jost-medium text-xl text-text",
      body: "font-jost text-base text-text",
      muted: "font-jost text-base text-muted",
      caption: "font-jost text-sm text-muted",
      onAccent: "font-jost-medium text-base text-text",
      emoji: "text-2xl",
    },
  },
  defaultVariants: { variant: "body" },
});

type TextProps = NativeTextProps & VariantProps<typeof text>;

export function Text({ variant, className, ...props }: TextProps) {
  return <NativeText className={text({ variant, className })} {...props} />;
}
