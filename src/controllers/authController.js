import { prisma } from "../database/prisma.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const UserSignUp = async (req, res) => {
  const userCreateSchema = z.object({
    firstName: z.string().min(3),
    lastName: z.string().min(3),
    email: z.email(),
    password: z.string().min(8),
  });

  const { success, data, error } = userCreateSchema.safeParse(req.body);

  if (!success) {
    return res
      .status(400)
      .json({ message: "Validation failed", data: z.flattenError(error) });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passwordHash: passwordHash,
  };

  const createdUser = await prisma.user.create({
    data: user,
  });

  res.json({ user: createdUser });
};

export const UserSignIn = async (req, res) => {
  const userSignInSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
  });
  const { success, data, error } = userSignInSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "validation failed",
      data: z.flattenError(error),
    });
  }
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return res.json({ message: "user not found" });
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash
  );
  if (!isPasswordValid) {
    return res.json({ message: "Invalid Password" });
  }
  const secretKey = process.env.JWT_SECRET;
  const accessToken = jwt.sign({ sub: user.id }, secretKey, {
    expiresIn: "1h",
  });
  res.json({
    status: "success",
    message: "Sign-In successFull",
    data: accessToken,
  });
};

export const getCurrentUser = async (req, res) => {
  const user = req.user;
  res.json({
    data: user,
  });
};
