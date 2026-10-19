import { ActivityIndicator, View } from "react-native";

import { Text } from "./Text";

type EmptyStateProps = {
  message: string;
  isLoading?: boolean;
};

export function EmptyState({ message, isLoading = false }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-6 py-10">
      {isLoading && <ActivityIndicator />}
      <Text variant="muted" className="text-center">
        {message}
      </Text>
    </View>
  );
}
