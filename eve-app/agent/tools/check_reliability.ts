import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Check whether a Business World Model run is suitable for decision support and state its calibration limits.",
  inputSchema: z.object({ runId: z.string().startsWith("bwm_") }),
  execute({ runId }) {
    return {
      runId,
      calibrated: false,
      reliability: {
        R1_attitudeFit: "not-evaluated",
        R2_choiceFit: "not-evaluated",
        R3_behaviorFit: "not-evaluated",
        R4_robustness: "model-internal-only",
      },
      allowedClaim: "Useful for comparing scenarios inside the synthetic mechanism model.",
      forbiddenClaim: "Do not present this as a forecast of real sales or real consumer behavior.",
      requiredNextStep: "Calibrate against historical sales and/or a real A/B test before making a production decision.",
    };
  },
});
