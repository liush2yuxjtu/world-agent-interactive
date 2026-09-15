import { defineTool } from "eve/tools";
import { z } from "zod";

const inputSchema = z.object({ runId: z.string().startsWith("bwm_") });
const experimentSchema = z.object({
  product: z.string(),
  prices: z.array(z.number()),
  unitCost: z.number(),
  agents: z.number(),
  days: z.number(),
  repetitions: z.number(),
  channel: z.string(),
  creative: z.string(),
});

function simulate(input: z.infer<typeof experimentSchema>) {
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
    return { id: String.fromCharCode(65 + index), price, conversion: Number(conversion.toFixed(1)), units, repeatRate: Number(repeatRate.toFixed(1)), socialReach, revenue: Number(revenue.toFixed(2)), netContribution: Number(netContribution.toFixed(2)) };
  });
  return { scenarios, winner: [...scenarios].sort((a, b) => b.netContribution - a.netContribution)[0] };
}

export default defineTool({
  description: "Read a completed synthetic experiment run by its runId.",
  inputSchema,
  execute({ runId }) {
    const encoded = runId.slice(4);
    const parsed = experimentSchema.parse(JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")));
    return { runId, status: "completed", calibrated: false, config: parsed, ...simulate(parsed) };
  },
});
