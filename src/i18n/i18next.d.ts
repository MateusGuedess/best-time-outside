import "i18next";

import type pt from "./locales/pt.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: typeof pt };
  }
}
