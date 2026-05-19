import { z } from "zod";

const categoryEnum = z.enum([
  "electronics",
  "fashion",
  "home",
  "beauty",
  "automotive",
  "sports",
  "books",
  "tshirt",
  "shirt",
  "jeans",
  "jacket",
  "shoes",
  "accessories",
]);

const sizeEnum = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);

const productFields = {
  name: z.string().trim().min(1, "Product name is required").max(255, "Product name is too long"),
  sku: z.string().trim().min(1, "SKU is required").max(255, "SKU is too long"),
  image: z.string().trim().max(1000, "Image URL is too long").optional().nullable(),
  description: z.string().trim().max(5000, "Description is too long").optional().nullable(),
  category: categoryEnum,
  color: z.string().trim().max(50, "Color is too long").optional().nullable(),
  size: sizeEnum.optional().nullable(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  isActive: z.boolean().optional().default(true),
  isHero: z.boolean().optional().default(false),
};

export const createProductDTO = z.object(productFields);

export const updateProductDTO = z
  .object({
    ...productFields,
    isActive: z.boolean().optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one product field must be provided",
  });
