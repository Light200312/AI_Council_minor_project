import express from "express";
import authGuard from "../../shared/authGuard.js";
import { listMessages, createMessage } from "./message.controller.js";

const router = express.Router();
router.get("/", authGuard, listMessages);
router.post("/", authGuard, createMessage);

export default router;
