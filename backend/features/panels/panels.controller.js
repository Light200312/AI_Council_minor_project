import { generateLawPanel, generateInterviewPanel, generateMedicalPanel } from "./panels.service.js";

export async function lawPanel(req, res) {
  try {
    const { topic } = req.body || {};
    if (!topic) return res.status(400).json({ message: "topic is required." });
    const result = generateLawPanel(topic);
    return res.json(result);
  } catch (error) { console.error("Law panel generation failed:", error); return res.status(500).json({ message: "Failed to generate law panel.", error: error.message }); }
}

export async function interviewPanel(req, res) {
  try {
    const { scenario } = req.body || {};
    if (!scenario) return res.status(400).json({ message: "scenario is required." });
    const result = generateInterviewPanel(scenario);
    return res.json(result);
  } catch (error) { console.error("Interview panel generation failed:", error); return res.status(500).json({ message: "Failed to generate interview panel.", error: error.message }); }
}

export async function medicalPanel(req, res) {
  try {
    const { medicalCase } = req.body || {};
    if (!medicalCase) return res.status(400).json({ message: "medicalCase is required." });
    const result = generateMedicalPanel(medicalCase);
    return res.json(result);
  } catch (error) { console.error("Medical panel generation failed:", error); return res.status(500).json({ message: "Failed to generate medical panel.", error: error.message }); }
}
