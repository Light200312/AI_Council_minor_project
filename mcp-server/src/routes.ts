import { Router, Request, Response } from "express";
import { factCheck } from "./tools/factCheck";

export const router = Router();

router.post("/mcp/fact-check", async (req: Request, res: Response) => {
  try {
    const claim = String(req.body?.claim ?? "").trim();
    if (!claim) {
      return res.status(400).json({
        error: "Invalid request. 'claim' is required."
      });
    }

    const result = await factCheck(claim);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Fact-check failed.",
      message
    });
  }
});
