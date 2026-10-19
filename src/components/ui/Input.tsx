import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { Text } from "./Text";

type InputProps = TextInputProps & {
  onClear?: () => void;
  clearLabel?: string;
};

export function Input({ value, onClear, clearLabel, ...props }: InputProps) {
  const canClear = onClear !== undefined && Boolean(value);

  return (
    <View className="h-12 flex-row items-center rounded-xl bg-surface pl-4">
      <TextInput
        value={value}
        className="h-full flex-1 text-base text-text"
        placeholderClassName="text-muted"
        {...props}
      />
      {canClear && (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          className="h-12 w-12 items-center justify-center active:opacity-60"
        >
          <Text variant="muted">✕</Text>
        </Pressable>
      )}
    </View>
  );
}
