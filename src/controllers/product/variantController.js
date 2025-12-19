import { prisma } from "../../database/prisma.js";
import { z } from "zod";

export const getAllVariant = async (req, res) => {
  const variants = await prisma.productVariant.findMany();

  res.json({
    status: "success",
    message: "All product variants fetched successfully",
    data: variants,
  });
};

export const getVariantById = async (req, res) => {
  const variantId = req.params.id;

  const schema = z.object({
    id: z.uuid(),
  });

  const { success, data, error } = schema.safeParse({ id: variantId });

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    return res.status(404).json({
      status: "error",
      message: "Variant not found",
    });
  }

  res.json({
    status: "success",
    message: "Product variant fetched successfully",
    data: variant,
  });
};

export const createVariant = async (req, res) => {
  const {
    productId,
    variantName,
    variantValue,
    priceAdjustment,
    stockQuantity,
    imageUrl,
  } = req.body;

  const createSchema = z.object({
    productId: z.uuid(),
    variantName: z.string().max(50),
    variantValue: z.string().max(50),
    priceAdjustment: z.number().optional().default(0.0),
    stockQuantity: z.number().int().nonnegative().optional().default(0),
    imageUrl: z.string().url().optional(),
  });

  const { success, data, error } = createSchema.safeParse({
    productId,
    variantName,
    variantValue,
    priceAdjustment,
    stockQuantity,
    imageUrl,
  });

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: " + error.errors.map((e) => e.message).join(", "),
    });
  }

  const newVariant = await prisma.productVariant.create({
    data: {
      productId: data.productId,
      variantName: data.variantName,
      variantValue: data.variantValue,
      priceAdjustment: data.priceAdjustment,
      stockQuantity: data.stockQuantity,
      imageUrl: data.imageUrl,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Product variant created successfully",
    data: newVariant,
  });
};

export const updateVariant = async (req, res) => {
  const variantId = req.params.id;

  const paramSchema = z.object({
    id: z.uuid(),
  });

  const bodySchema = z.object({
    productId: z.uuid().optional(),
    variantName: z.string().max(50).optional(),
    variantValue: z.string().max(50).optional(),
    priceAdjustment: z.number().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
  });

  const paramValidation = paramSchema.safeParse({ id: variantId });
  if (!paramValidation.success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }
  const bodyValidation = bodySchema.safeParse(req.body);
  if (!bodyValidation.success) {
    return res.status(400).json({
      status: "error",
      message:
        "Bad request: " +
        bodyValidation.error.errors.map((e) => e.message).join(", "),
    });
  }

  const existingVariant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!existingVariant) {
    return res.status(404).json({
      status: "error",
      message: "Variant not found",
    });
  }

  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: bodyValidation.data,
  });

  res.json({
    status: "success",
    message: "Product variant updated successfully",
    data: updatedVariant,
  });
};

export const deleteVariant = async (req, res) => {
  const variantId = req.params.id;

  const schema = z.object({
    id: z.uuid(),
  });

  const { success } = schema.safeParse({ id: variantId });
  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    return res.status(404).json({
      status: "error",
      message: "Variant not found",
    });
  }

  await prisma.productVariant.delete({
    where: { id: variantId },
  });

  res.json({
    status: "success",
    message: "Product variant deleted successfully",
  });
};
