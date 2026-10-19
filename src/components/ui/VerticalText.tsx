import { View } from "react-native";

import { Text } from "./Text";

export function VerticalText({ children }: { children: string }) {
  return (
    <View accessible accessibilityLabel={children} className="items-center">
      {Array.from(children.toUpperCase()).map((letter, index) => (
        <Text key={`${letter}-${index}`} variant="label" importantForAccessibility="no">
          {letter}
        </Text>
      ))}
    </View>
  );
}
