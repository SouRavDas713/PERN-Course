import { prisma } from "../database/prisma.js";
import { z } from "zod";

export const getAllCategory = async (req, res) => {
  const categories = await prisma.category.findMany();

  res.json({
    status: "success",
    message: "Category fetched Successfully",
    data: { categories },
  });
};

export const getACategory = async (req, res) => {
  const categoryId = req.params.id;

  const categorySchema = z.object({
    id: z.uuid(),
  });

  const { success, data, error } = categorySchema.safeParse({ id: categoryId });

  if (!success) {
    res.status(400).json({
      status: "error",
      message: "Bad request",
    });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return res.status(404).json({
      status: "error",
      message: "Category not found",
    });
  }

  res.json({
    status: "success",
    message: "Category fetched Successfully",
    data: { category },
  });
};

export const createCategory = async (req, res) => {
  const categoryCreateSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().min(5),
    imageUrl: z.string().url(),
    parentId: z.uuid().optional(),
  });

  const validation = categoryCreateSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      status: "error",
      message:
        "Bad request: " +
        validation.error.errors.map((e) => e.message).join(", "),
    });
  }

  if (validation.data.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: validation.data.parentId },
    });

    if (!parentCategory) {
      return res.status(404).json({
        status: "error",
        message: "Parent category not found",
      });
    }
  }

  const createdCategory = await prisma.category.create({
    data: {
      name: validation.data.name,
      slug: validation.data.slug,
      description: validation.data.description,
      imageUrl: validation.data.imageUrl,
      parentId: validation.data.parentId,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: { category: createdCategory },
  });
};


export const updateCategory = async (req, res) => {
  const categoryId = req.params.id;

  const paramSchema = z.object({
    id: z.uuid(),
  });

  const paramValidation = paramSchema.safeParse({ id: categoryId });
  if (!paramValidation.success) {
    return res.status(400).json({
      status: "error",
      message: "Bad request: Invalid UUID format",
    });
  }

  const categoryUpdateSchema = z.object({
    name: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    imageUrl: z.string().url().optional(),
    parentId: z.uuid().nullable().optional(),
  });

  const bodyValidation = categoryUpdateSchema.safeParse(req.body);
  if (!bodyValidation.success) {
    return res.status(400).json({
      status: "error",
      message:
        "Bad request: " +
        bodyValidation.error.errors.map((e) => e.message).join(", "),
    });
  }


  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    return res.status(404).json({
      status: "error",
      message: "Category not found",
    });
  }

  if (bodyValidation.data.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: bodyValidation.data.parentId },
    });

    if (!parentCategory) {
      return res.status(404).json({
        status: "error",
        message: "Parent category not found",
      });
    }

    if (bodyValidation.data.parentId === categoryId) {
      return res.status(400).json({
        status: "error",
        message: "Category cannot be its own parent",
      });
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: bodyValidation.data,
  });

  res.json({
    status: "success",
    message: "Category updated successfully",
    data: { category: updatedCategory },
  });
};


export const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  const categorySchema = z.object({
    id: z.uuid(),
  });

  const { success, data, error } = categorySchema.safeParse({ id: categoryId });

  if (!success) {
    res.status(400).json({
      status: "error",
      message: "Bad request",
    });
  }

  const deletedCategory = await prisma.category.delete({
    where: { id: categoryId },
  });

  res.json({
    status: "success",
    message: "Category deleted Successfully",
    data: { category: deletedCategory },
  });
};
