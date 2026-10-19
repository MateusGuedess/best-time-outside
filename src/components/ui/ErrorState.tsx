import { Pressable, View } from "react-native";

import { Text } from "./Text";

type ErrorStateProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <View className="items-center gap-4 px-6 py-10">
      <Text variant="muted" className="text-center">
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        className="min-h-11 justify-center rounded-full bg-accent px-6 active:opacity-60"
      >
        <Text variant="onAccent">{retryLabel}</Text>
      </Pressable>
    </View>
  );
}
