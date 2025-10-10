import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import {
  loginSchema,
  registerSchema,
  createAuthSchema,
  updateAuthSchema,
  refreshTokenSchema,
  authSchema,
} from "./auth.schemas";
import AuthModel from "./auth.model";
import { verifyToken, verifyRefreshToken, setTokens } from "../../hooks/auth";
import "./auth.swagger";

dotenv.config();
const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Validation error",
        details: validationResult.error.issues,
      });

    const { email, password } = validationResult.data;
    const user = await AuthModel.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const tokens = setTokens(user._id.toString());
    const resultCheckZod = authSchema.safeParse(user);
    if (!resultCheckZod.success)
      return res.status(405).json({ error: "Data validation error" });

    return res.status(200).json({
      message: "Login successful",
      data: resultCheckZod.data,
      tokens,
    });
  } catch (error) {
    console.warn("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Validation error",
        details: validationResult.error.issues,
      });

    const { email, password, phone } = validationResult.data;
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await AuthModel.create({
      email,
      password: hashedPassword,
      phone: phone || null,
    });
    const tokens = setTokens(newUser._id.toString());
    const resultCheckZod = authSchema.safeParse(newUser);
    if (!resultCheckZod.success)
      return res.status(405).json({ error: "Data validation error" });

    return res.status(201).json({
      message: "Registration successful",
      data: resultCheckZod.data,
      tokens,
    });
  } catch (error) {
    console.warn("Registration error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = verifyToken(token);
    if (!decoded)
      return res.status(401).json({ error: "Invalid or expired token" });

    const user = await AuthModel.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const resultCheckZod = authSchema.safeParse(user);
    if (!resultCheckZod.success)
      return res.status(405).json({ error: "Data validation error" });

    return res.status(200).json({ data: resultCheckZod.data });
  } catch (error) {
    console.warn("Get me error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/refresh-token", async (req: Request, res: Response) => {
  try {
    const validationResult = refreshTokenSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Validation error",
        details: validationResult.error.issues,
      });

    const { refreshToken } = validationResult.data;
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded)
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });

    const user = await AuthModel.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const tokens = setTokens(user._id.toString());
    return res.status(200).json({
      message: "Token refreshed successfully",
      tokens,
    });
  } catch (error) {
    console.warn("Refresh token error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/create", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = verifyToken(token);
    if (!decoded)
      return res.status(401).json({ error: "Invalid or expired token" });

    const validationResult = createAuthSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Validation error",
        details: validationResult.error.issues,
      });

    const { email, password, phone } = validationResult.data;

    const existingUser = await AuthModel.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await AuthModel.create({
      email,
      password: hashedPassword,
      phone: phone || null,
    });
    const resultCheckZod = authSchema.safeParse(newUser);
    if (!resultCheckZod.success)
      return res.status(405).json({ error: "Data validation error" });

    return res.status(201).json({
      message: "User created successfully",
      data: resultCheckZod.data,
    });
  } catch (error) {
    console.warn("Create user error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/update/:id", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = verifyToken(token);
    if (!decoded)
      return res.status(401).json({ error: "Invalid or expired token" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid user ID" });

    const validationResult = updateAuthSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Validation error",
        details: validationResult.error.issues,
      });

    const updateData: any = {};
    if (validationResult.data.email)
      updateData.email = validationResult.data.email;
    if (validationResult.data.password)
      updateData.password = await bcrypt.hash(
        validationResult.data.password,
        10
      );
    if (validationResult.data.phone !== undefined)
      updateData.phone = validationResult.data.phone;

    const updatedUser = await AuthModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const resultCheckZod = authSchema.safeParse(updatedUser);
    if (!resultCheckZod.success)
      return res.status(405).json({ error: "Data validation error" });

    return res.status(200).json({
      message: "User updated successfully",
      data: resultCheckZod.data,
    });
  } catch (error) {
    console.warn("Update user error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = verifyToken(token);
    if (!decoded)
      return res.status(401).json({ error: "Invalid or expired token" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid user ID" });

    const deletedUser = await AuthModel.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.warn("Delete user error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = verifyToken(token);
    if (!decoded)
      return res.status(401).json({ error: "Invalid or expired token" });

    const users = await AuthModel.find();
    const usersData = users.map((user) => ({
      _id: user._id,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    return res.status(200).json({
      message: "Users retrieved successfully",
      data: usersData,
    });
  } catch (error) {
    console.warn("Get all users error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
