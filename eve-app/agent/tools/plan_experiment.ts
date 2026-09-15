import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Turn a business comparison question into a controlled synthetic-market experiment plan.",
  inputSchema: z.object({
    product: z.string().min(1),
    prices: z.array(z.number().positive()).min(2).max(4),
    unitCost: z.number().nonnegative().default(2.4),
    agents: z.number().int().min(50).max(3000).default(100),
    days: z.number().int().min(7).max(180).default(14),
    repetitions: z.number().int().min(1).max(30).default(2),
    channel: z.string().default("小红书"),
    creative: z.string().default("健康轻盈"),
  }),
  execute(input) {
    return {
      experimentType: "controlled-price-test",
      product: input.product,
      controlledVariables: {
        channel: input.channel,
        creative: input.creative,
        unitCost: input.unitCost,
        agents: input.agents,
        days: input.days,
        repetitions: input.repetitions,
      },
      scenarios: input.prices.map((price, index) => ({
        id: String.fromCharCode(65 + index),
        price,
      })),
      calibrated: false,
      runInput: input,
      nextAction: "Call run_experiment with this plan. Eve will request native approval before execution.",
    };
  },
});
