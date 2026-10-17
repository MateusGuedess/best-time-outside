// Spike temporário (decisão 007): valida NativeWind + tema claro/escuro no SDK atual.
import { Text, View } from "react-native";
import { useColorScheme } from "nativewind";

export default function SpikeScreen() {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
      <View className="w-full rounded-2xl bg-surface p-6">
        <Text className="text-2xl font-bold text-text">NativeWind OK</Text>
        <Text className="mt-2 text-muted">Tema atual: {colorScheme}</Text>
        <View className="mt-4 flex-row gap-2">
          <View className="h-6 flex-1 rounded-full bg-score-good" />
          <View className="h-6 flex-1 rounded-full bg-score-ok" />
          <View className="h-6 flex-1 rounded-full bg-score-bad" />
        </View>
      </View>
    </View>
  );
}
