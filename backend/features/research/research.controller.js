import { researchServiceStub } from "./research.service.js";

export async function researchAction(req, res, next) {
  try {
    await researchServiceStub();

    res.status(501).json({
      message: "Research feature is not implemented yet."
    });
  } catch (error) {
    next(error);
  }
}