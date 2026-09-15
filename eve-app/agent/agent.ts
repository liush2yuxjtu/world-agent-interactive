import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-5.6-sol",
  reasoning: "medium",
  defaultTools: false,
});
