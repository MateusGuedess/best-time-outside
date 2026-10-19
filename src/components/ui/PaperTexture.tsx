import { Image, View } from "react-native";

import { PAPER_TEXTURE } from "@/theme/textures";

export function PaperTexture() {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-0"
    >
      <Image
        source={PAPER_TEXTURE}
        resizeMode="repeat"
        fadeDuration={0}
        className="h-full w-full"
      />
    </View>
  );
}
