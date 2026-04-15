import express from "express";
import authGuard from "../../shared/authGuard.js";
import { register, login, me } from "./auth.controller.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", authGuard, me);

export default router;
