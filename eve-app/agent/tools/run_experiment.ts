import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

const schema = z.object({
  product: z.string().min(1),
  prices: z.array(z.number().positive()).min(2).max(4),
  unitCost: z.number().nonnegative().default(2.4),
  agents: z.number().int().min(50).max(3000).default(100),
  days: z.number().int().min(7).max(180).default(14),
  repetitions: z.number().int().min(1).max(30).default(2),
  channel: z.string().default("小红书"),
  creative: z.string().default("健康轻盈"),
});

type ExperimentInput = z.infer<typeof schema>;

function simulate(input: ExperimentInput) {
  const scale = input.agents / 100;
  const scenarios = input.prices.map((price, index) => {
    const conversion = Math.max(3, 17 - price * 0.6 - index * 0.1);
    const units = Math.round(input.agents * conversion / 100 * (1 + input.days / 140));
    const socialReach = Math.round(units * (1.7 + (10 - price) * 0.03));
    const repeatRate = Math.max(5, Math.min(45, 19 + price * 1.15));
    const revenue = units * price;
    const variableCost = units * input.unitCost;
    const experimentCost = 42 * scale * input.repetitions;
    const netContribution = revenue - variableCost - experimentCost;
    return {
      id: String.fromCharCode(65 + index),
      price,
      conversion: Number(conversion.toFixed(1)),
      units,
      repeatRate: Number(repeatRate.toFixed(1)),
      socialReach,
      revenue: Number(revenue.toFixed(2)),
      netContribution: Number(netContribution.toFixed(2)),
    };
  });
  const winner = [...scenarios].sort((a, b) => b.netContribution - a.netContribution)[0];
  return { scenarios, winner };
}

export default defineTool({
  description: "Run the synthetic Business World Model experiment. This action must always be explicitly approved by the user before execution.",
  inputSchema: schema,
  approval: always(),
  execute(input) {
    const payload = Buffer.from(JSON.stringify(input), "utf8").toString("base64url");
    const result = simulate(input);
    return {
      runId: `bwm_${payload}`,
      status: "completed",
      calibrated: false,
      ...result,
      warning: "Synthetic mechanism demo only; not a real-market forecast.",
    };
  },
});
