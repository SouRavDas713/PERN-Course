import { prisma } from "../../database/prisma.js";
import { z } from "zod";

export const getAllProduct = async (req, res) => {
  const products = await prisma.product.findMany({});

  res.json({
    status: "success",
    message: "Product fetched Successfully",
    data: { products },
  });
};

export const getAProduct = async (req, res) => {
  const productId = req.params.id;

  const productSchema = z.object({
    id: z.uuid(),
  });

  const { success, data, error } = productSchema.safeParse({ id: productId });

  if (!success) {
    res.status(400).json({
      status: "error",
      message: "Bad request",
    });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      images: true,
      variants: true,
    },
  });

  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Product not found",
    });
  }

  res.json({
    status: "success",
    message: "Product fetched Successfully",
    data: { product },
  });
};

export const createProduct = async (req, res) => {

  const productCreateSchema = z.object({
    title: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().min(5),
    basePrice: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    stockQuantity: z.number().int().nonnegative(),
    specifications: z.any(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.uuid(),
  });

  const { success, data, error } = productCreateSchema.safeParse(req.body);

  console.log(error);

  if (!success) {
    res.status(400).json({
      status: "error",
      message:
        "Bad request payload should have title, slug, description, basePrice, originalPrice, stockQuantity, specifications, isFeatured, isActive, and categoryId",
    });
  }

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    res.json({
      status: "error",
      message: "Bad request invalid categoryId",
    });
  }

  const productPayload = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    basePrice: data.basePrice,
    originalPrice: data.originalPrice,
    stockQuantity: data.stockQuantity,
    specifications: data.specifications,
    isFeatured: data.isFeatured ?? false,
    isActive: data.isActive ?? true,
    categoryId: data.categoryId,
  };

  const createdProduct = await prisma.product.create({
    data: productPayload,
  });

  res.json({
    status: "success",
    message: "Product Created Successfully",
    data: { product: createdProduct },
  });
};

export const updateProduct = async (req, res) => {
  const productId = req.params.id;

  const paramSchema = z.object({
    id: z.uuid(),
  });

  const paramValidation = paramSchema.safeParse({ id: productId });
  if (!paramValidation.success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }

  const productUpdateSchema = z.object({
    title: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    basePrice: z.number().positive().optional(),
    originalPrice: z.number().positive().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    specifications: z.any().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    categoryId: z.uuid().optional(),
  });

  const bodyValidation = productUpdateSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    return res.status(400).json({
      status: "error",
      message:
        "Bad request: " +
        bodyValidation.error.errors.map((e) => e.message).join(", "),
    });
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    return res.status(404).json({
      status: "error",
      message: "Product not found",
    });
  }
  
  if (bodyValidation.data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: bodyValidation.data.categoryId },
    });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found for the given categoryId",
      });
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: bodyValidation.data,
  });

  res.json({
    status: "success",
    message: "Product updated successfully",
    data: { product: updatedProduct },
  });
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  const schema = z.object({
    id: z.uuid(),
  });

  const { success } = schema.safeParse({ id: productId });
  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Product not found",
    });
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  res.json({
    status: "success",
    message: "Product deleted successfully",
  });
};


