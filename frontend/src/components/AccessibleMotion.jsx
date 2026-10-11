import { MotionConfig } from "framer-motion";
import { useAppStore } from "../store/useAppStore";

function AccessibleMotion({ children }) {
  const motionPreference = useAppStore((state) => state.motionPreference);
  const reducedMotion =
    motionPreference === "reduce" ? "always" : motionPreference === "full" ? "never" : "user";

  return <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>;
}

export { AccessibleMotion };
