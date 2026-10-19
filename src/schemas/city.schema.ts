import { z } from "zod";

export const citySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  region: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().length(2).optional(),
});
