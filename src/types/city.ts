import type { z } from "zod";

import type { citySchema } from "@/schemas/geocoding.schema";

export type City = z.output<typeof citySchema>;
