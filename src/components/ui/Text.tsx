import { Text as NativeText, type TextProps as NativeTextProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants/lite";

const text = tv({
  variants: {
    variant: {
      title: "text-xl font-semibold text-text",
      body: "text-base text-text",
      muted: "text-base text-muted",
      caption: "text-sm text-muted",
      onAccent: "text-base font-semibold text-background",
      emoji: "text-2xl",
    },
  },
  defaultVariants: { variant: "body" },
});

type TextProps = NativeTextProps & VariantProps<typeof text>;

export function Text({ variant, className, ...props }: TextProps) {
  return <NativeText className={text({ variant, className })} {...props} />;
}
