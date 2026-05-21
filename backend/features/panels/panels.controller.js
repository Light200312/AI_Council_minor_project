/**
 * Panels Controller
 * WHY: Generate specialized expert panels for different use cases (law, interview, medical)
 * HOW: Service-based generation of expert agent configurations per domain
 * RESULT: Panel configurations with relevant agents for domain-specific scenarios
 */

import { generateLawPanel, generateInterviewPanel, generateMedicalPanel } from "./panels.service.js";

function getTrimmedField(req, fieldName) {
  return String(req.body?.[fieldName] ?? "").trim();
}

function validateTextInput(res, value, label, minLength = 3) {
  if (!value) {
    res.status(400).json({ message: `${label} is required.` });
    return false;
  }
  if (value.length < minLength) {
    res.status(400).json({ message: `${label} must be at least ${minLength} characters long.` });
    return false;
  }
  return true;
}

/**
 * lawPanel - Generate legal expert panel
 * WHY: Create specialized team for law-related discussions
 * HOW: Service generates relevant legal experts, assigns roles
 * RESULT: Panel object with legal experts configured for topic
 */
export async function lawPanel(req, res) {
  try {
    const topic = getTrimmedField(req, "topic");
    if (!validateTextInput(res, topic, "Legal topic")) return;
    const result = generateLawPanel(topic);
    return res.json(result);
  } catch (error) {
    console.error("Law panel generation failed:", error);
    return res.status(500).json({ message: "Could not generate the legal panel. Please try again." });
  }
}


/**
 * interviewPanel - Generate interview coach panel
 * WHY: Create team for interview preparation and practice
 * HOW: Service generates interviewers and coaches for given scenario
 * RESULT: Panel with interview coaches tailored to scenario
 */
export async function interviewPanel(req, res) {
  try {
    const scenario = getTrimmedField(req, "scenario");
    if (!validateTextInput(res, scenario, "Interview scenario")) return;
    const result = generateInterviewPanel(scenario);
    return res.json(result);
  } catch (error) {
    console.error("Interview panel generation failed:", error);
    return res.status(500).json({ message: "Could not generate the interview panel. Please try again." });
  }
}


/**
 * medicalPanel - Generate medical expert panel
 * WHY: Create specialized team for medical case discussions
 * HOW: Service generates medical professionals relevant to case type
 * RESULT: Panel with medical experts configured for case study
 */
export async function medicalPanel(req, res) {
  try {
    const medicalCase = getTrimmedField(req, "medicalCase");
    if (!validateTextInput(res, medicalCase, "Medical case", 10)) return;
    const result = generateMedicalPanel(medicalCase);
    return res.json(result);
  } catch (error) {
    console.error("Medical panel generation failed:", error);
    return res.status(500).json({ message: "Could not generate the medical panel. Please try again." });
  }
}
