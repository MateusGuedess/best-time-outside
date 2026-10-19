import type { z } from "zod";

import type { citySchema } from "@/schemas/city.schema";

export type City = z.output<typeof citySchema>;
