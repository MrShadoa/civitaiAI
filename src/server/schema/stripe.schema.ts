import { z } from 'zod';
import { Currency } from '@prisma/client';

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export const createCustomerSchema = z.object({ id: z.number(), email: z.string().email() });

export type CreateSubscribeSessionInput = z.infer<typeof createSubscribeSessionSchema>;
export const createSubscribeSessionSchema = z.object({ priceId: z.string() });

export type GetUserSubscriptionInput = z.infer<typeof getUserSubscriptionSchema>;
export const getUserSubscriptionSchema = z.object({ userId: z.number() });

export type CreateDonateSessionInput = z.infer<typeof createDonateSessionSchema>;
export const createDonateSessionSchema = z.object({ returnUrl: z.string() });

export type CreateBuzzSessionInput = z.infer<typeof createBuzzSessionSchema>;
export const createBuzzSessionSchema = z.object({ priceId: z.string(), returnUrl: z.string() });

export type BuzzPriceMetadata = z.infer<typeof buzzPriceMetadataSchema>;
export const buzzPriceMetadataSchema = z.object({
  buzzAmount: z.coerce.number().positive(),
});

export type PaymentIntentCreationSchema = z.infer<typeof paymentIntentCreationSchema>;
export const paymentIntentCreationSchema = z.object({
  unitAmount: z.number().min(500),
  currency: z.nativeEnum(Currency),
  metadata: z.object({}).passthrough().nullish(),
});
