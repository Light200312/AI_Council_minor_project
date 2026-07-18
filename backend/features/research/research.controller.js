import { performResearch } from "./research.service.js";

export async function researchAction(req, res, next) {
  try {
    const topic = req.body?.topic ?? req.query?.topic;
    const options = req.body?.options && typeof req.body.options === "object" ? req.body.options : {};
    const result = await performResearch(topic, options);
    return res.json(result);
  } catch (error) {
    if (next) return next(error);
    return res.status(400).json({ message: error.message || "Research failed." });
  }
}
