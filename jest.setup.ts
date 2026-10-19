import i18n from "@/i18n";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

beforeAll(() => i18n.changeLanguage("pt"));
