import { performResearch } from "./research.service.js";

export async function researchAction(req, res, next) {
  try {
    const topic = req.body?.topic ?? req.query?.topic;
    // Validate that topic is provided and is not empty
    if (!topic || !String(topic).trim()) {
      return res.status(400).json({
        error: "topic is required"
      });
    }

    const options = req.body?.options && typeof req.body.options === "object" ? req.body.options : {};
    const result = await performResearch({
      topic,
      discussionMode: req.body?.discussionMode ?? options.discussionMode,
      toolCalls: req.body?.toolCalls ?? options.toolCalls,
    });
    return res.json(result);
  } catch (error) {
    if (next) return next(error);
    return res.status(400).json({ message: error.message || "Research failed." });
  }
}
