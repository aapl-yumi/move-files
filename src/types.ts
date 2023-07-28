import { z } from "zod";

const randomId = () => {
  return Math.random().toString(36).slice(2);
};

export const DestinationSchema = z.object({
  id: z.string().default(randomId()),
  destination: z.string().default(""),
  title: z.string().default(""),
  fileTypes: z.array(z.string()).optional(),
  fileRegex: z.string().optional(),
});

export type Destination = z.infer<typeof DestinationSchema>;
