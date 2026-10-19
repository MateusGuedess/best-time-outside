const reanimatedMock = require("react-native-reanimated/lib/module/mock");

module.exports = {
  ...reanimatedMock,
  useReducedMotion: () => true,
};
