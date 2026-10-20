import { Pressable, View } from "react-native";

import type { City } from "@/types/city";

import { cityLocation } from "./cityLocation";
import { Text } from "./ui/Text";

const REGIONAL_INDICATOR_A = 0x1f1e6;

function countryFlag(countryCode: string): string {
  return String.fromCodePoint(
    ...[...countryCode].map((letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - 65),
  );
}

type CityListItemProps = {
  city: City;
  onPress: (city: City) => void;
};

export function CityListItem({ city, onPress }: CityListItemProps) {
  const location = cityLocation(city);

  return (
    <Pressable
      onPress={() => onPress(city)}
      accessibilityRole="button"
      accessibilityLabel={location ? `${city.name}, ${location}` : city.name}
      className="min-h-14 flex-row items-center gap-3 px-4 py-3 active:opacity-60"
    >
      {city.countryCode && <Text variant="emoji">{countryFlag(city.countryCode)}</Text>}
      <View className="flex-1">
        <Text>{city.name}</Text>
        {location !== "" && <Text variant="caption">{location}</Text>}
      </View>
    </Pressable>
  );
}
