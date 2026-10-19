import { z } from "zod";

export const citySchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    admin1: z.string().optional(),
    country: z.string().optional(),
    country_code: z.string().length(2).optional(),
  })
  .transform(({ id, name, latitude, longitude, admin1, country, country_code }) => ({
    id,
    name,
    latitude,
    longitude,
    region: admin1,
    country,
    countryCode: country_code?.toUpperCase(),
  }));

export const citySearchSchema = z
  .object({ results: z.array(citySchema).default([]) })
  .transform(({ results }) => results);
