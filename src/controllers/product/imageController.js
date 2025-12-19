import { prisma } from "../../database/prisma.js";
import { z } from "zod";

export const getAllImage = async (req, res) => {
  const images = await prisma.productImage.findMany();

  res.json({
    status: "success",
    message: "All product images fetched successfully",
    data: images,
  });
};

export const getImageById = async (req, res) => {
  const imageId = req.params.id;

  const imageSchema = z.object({
    id: z.uuid(),
  });

  const { success, data, error } = imageSchema.safeParse({ id: imageId });

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    return res.status(404).json({
      status: "error",
      message: "Image not found",
    });
  }

  res.json({
    status: "success",
    message: "Product image fetched successfully",
    data: image,
  });
};

export const createImage = async (req, res) => {
  const { productId, imageUrl, altText, displayOrder, isPrimary } = req.body;

  const createSchema = z.object({
    productId: z.uuid(),
    imageUrl: z.url(),
    altText: z.string().max(255).optional(),
    displayOrder: z.number().int().nonnegative().optional(),
    isPrimary: z.boolean().optional(),
  });

  const { success, data, error } = createSchema.safeParse({
    productId,
    imageUrl,
    altText,
    displayOrder,
    isPrimary,
  });

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request payload must have valid productId and imageUrl",
    });
  }

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Product not found for the given productId",
    });
  }

  const newImage = await prisma.productImage.create({
    data: {
      productId: data.productId,
      imageUrl: data.imageUrl,
      altText: data.altText,
      displayOrder: data.displayOrder ?? 0,
      isPrimary: data.isPrimary ?? false,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Product image created successfully",
    data: newImage,
  });
};

export const updateImage = async (req, res) => {
  const imageId = req.params.id;

  const paramSchema = z.object({
    id: z.uuid(),
  });

  const bodySchema = z.object({
    productId: z.uuid().optional(),
    imageUrl: z.url().optional(),
    altText: z.string().max(255).optional(),
    displayOrder: z.number().int().nonnegative().optional(),
    isPrimary: z.boolean().optional(),
  });

  const paramValidation = paramSchema.safeParse({ id: imageId });
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

  const existingImage = await prisma.productImage.findUnique({
    where: { id: imageId },
  });

  if (!existingImage) {
    return res.status(404).json({
      status: "error",
      message: "Image not found",
    });
  }

  if (bodyValidation.data.productId) {
    const product = await prisma.product.findUnique({
      where: { id: bodyValidation.data.productId },
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found for the given productId",
      });
    }
  }

  const updatedImage = await prisma.productImage.update({
    where: { id: imageId },
    data: bodyValidation.data,
  });

  res.json({
    status: "success",
    message: "Product image updated successfully",
    data: updatedImage,
  });
};

export const deleteImage = async (req, res) => {
  const imageId = req.params.id;

  const schema = z.object({
    id: z.uuid(),
  });

  const { success } = schema.safeParse({ id: imageId });

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    return res.status(404).json({
      status: "error",
      message: "Image not found",
    });
  }

  await prisma.productImage.delete({
    where: { id: imageId },
  });

  res.json({
    status: "success",
    message: "Product image deleted successfully",
  });
};
