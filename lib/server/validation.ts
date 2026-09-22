import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(10, "Use at least 10 characters.").max(128),
});

export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2, "Enter your name.").max(80),
});

export const savedItemSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  quantity: z.number().int().min(1).max(99),
  packageDescription: z.string().min(1).max(80),
  essential: z.boolean(),
  substitution: z.enum(["similar", "exact", "none"]),
  imageKey: z.enum(["milk", "bread", "eggs", "bananas", "mince", "toothpaste", "coffee", "pasta"]),
});

export const savedListSchema = z.object({
  eircode: z.string().trim().toUpperCase().min(3).max(10),
  listName: z.string().trim().min(1).max(80).default("Weekly groceries"),
  items: z.array(savedItemSchema).max(200),
});

export const checkoutHandoffSchema = z.object({
  retailerId: z.enum(["tesco", "supervalu"]),
  eircode: z.string().trim().toUpperCase().min(3).max(10),
  deliverySlotId: z.enum(["preferred", "following-day"]),
  items: z.array(savedItemSchema).min(1).max(200),
});
