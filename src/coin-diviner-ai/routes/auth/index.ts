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
import { verifyRefreshToken, setTokens, checkAuth } from "../../hooks/auth";
import { returnError, ErrorCode } from "./auth.helps";
import "./auth.swagger";

dotenv.config();
const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnError(
        res,
        400,
        "Validation error",
        ErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

    const { email, password } = validationResult.data;
    const user = await AuthModel.findOne({ email });
    if (!user)
      return returnError(
        res,
        401,
        "Invalid credentials",
        ErrorCode.INVALID_CREDENTIALS
      );

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return returnError(
        res,
        401,
        "Invalid credentials",
        ErrorCode.INVALID_CREDENTIALS
      );

    const tokens = setTokens(user._id.toString());
    const resultCheckZod = authSchema.safeParse(user);
    if (!resultCheckZod.success)
      return returnError(
        res,
        405,
        "Data validation error",
        ErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(200).json({
      message: "Login successful",
      data: resultCheckZod.data,
      tokens,
    });
  } catch (error) {
    console.warn("Login error:", error);
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnError(
        res,
        400,
        "Validation error",
        ErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

    const { email, password, phone } = validationResult.data;
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser)
      return returnError(
        res,
        409,
        "User already exists",
        ErrorCode.USER_ALREADY_EXISTS
      );

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await AuthModel.create({
      email,
      password: hashedPassword,
      phone: phone || null,
    });
    const tokens = setTokens(newUser._id.toString());
    const resultCheckZod = authSchema.safeParse(newUser);
    if (!resultCheckZod.success)
      return returnError(
        res,
        405,
        "Data validation error",
        ErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(201).json({
      message: "Registration successful",
      data: resultCheckZod.data,
      tokens,
    });
  } catch (error) {
    console.warn("Registration error:", error);
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user)
      return returnError(res, 404, "User not found", ErrorCode.USER_NOT_FOUND);

    const resultCheckZod = authSchema.safeParse(user);
    if (!resultCheckZod.success)
      return returnError(
        res,
        405,
        "Data validation error",
        ErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(200).json({ data: resultCheckZod.data });
  } catch (error) {
    console.warn("Get me error:", error);
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

router.post("/refresh-token", async (req: Request, res: Response) => {
  try {
    const validationResult = refreshTokenSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnError(
        res,
        400,
        "Validation error",
        ErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

    const { refreshToken } = validationResult.data;
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || "error" in decoded) {
      const errorCode =
        decoded &&
        "error" in decoded &&
        decoded.error === "EXPIRED_REFRESH_TOKEN"
          ? ErrorCode.EXPIRED_REFRESH_TOKEN
          : ErrorCode.INVALID_REFRESH_TOKEN;
      const errorMessage =
        errorCode === ErrorCode.EXPIRED_REFRESH_TOKEN
          ? "Refresh token expired"
          : "Invalid refresh token";
      return returnError(res, 401, errorMessage, errorCode);
    }

    const user = await AuthModel.findById(decoded.userId);
    if (!user)
      return returnError(res, 404, "User not found", ErrorCode.USER_NOT_FOUND);

    const tokens = setTokens(user._id.toString());
    return res.status(200).json({
      message: "Token refreshed successfully",
      tokens,
    });
  } catch (error) {
    console.warn("Refresh token error:", error);
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

router.post("/create", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const validationResult = createAuthSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnError(
        res,
        400,
        "Validation error",
        ErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

    const { email, password, phone } = validationResult.data;
    const existingUser = await AuthModel.findOne({ email });
    if (existingUser)
      return returnError(
        res,
        409,
        "User already exists",
        ErrorCode.USER_ALREADY_EXISTS
      );

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await AuthModel.create({
      email,
      password: hashedPassword,
      phone: phone || null,
    });
    const resultCheckZod = authSchema.safeParse(newUser);
    if (!resultCheckZod.success)
      return returnError(
        res,
        405,
        "Data validation error",
        ErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(201).json({
      message: "User created successfully",
      data: resultCheckZod.data,
    });
  } catch (error) {
    console.warn("Create user error:", error);
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

router.put("/update/:id", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return returnError(
        res,
        400,
        "Invalid user ID",
        ErrorCode.INVALID_USER_ID
      );

    const validationResult = updateAuthSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnError(
        res,
        400,
        "Validation error",
        ErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

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
    if (!updatedUser)
      return returnError(res, 404, "User not found", ErrorCode.USER_NOT_FOUND);

    const resultCheckZod = authSchema.safeParse(updatedUser);
    if (!resultCheckZod.success)
      return returnError(
        res,
        405,
        "Data validation error",
        ErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(200).json({
      message: "User updated successfully",
      data: resultCheckZod.data,
    });
  } catch (error) {
    console.warn("Update user error:", error);
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return returnError(
        res,
        400,
        "Invalid user ID",
        ErrorCode.INVALID_USER_ID
      );

    const deletedUser = await AuthModel.findByIdAndDelete(id);
    if (!deletedUser)
      return returnError(res, 404, "User not found", ErrorCode.USER_NOT_FOUND);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.warn("Delete user error:", error);
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

router.get("/get-all", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

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
    return returnError(res, 500, "Server error", ErrorCode.SERVER_ERROR);
  }
});

export default router;
