import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message must be at most 1000 characters long" }),  
});
