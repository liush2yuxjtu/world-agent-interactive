# Eve Chat Feature Contract

`intent/eve-price-experiment-chat/index.html` is the committed visual intent. `assistant/index.html` is the product route and must match that intent in the initial, approved, and 390px mobile snapshots.

## Product behavior

The user asks a business question in natural language. Eve plans the comparison first, exposes the assumptions, and waits for explicit approval. Only after approval may the flow enter `run_experiment`, then `get_run`, then `check_reliability`. The result must keep the `calibrated:false` boundary visible: model-internal evidence is not a real-market forecast.

## Eve mapping

The live Next.js/Eve implementation should keep the same sequence with `useEveAgent()` from `eve/react`. The durable agent remains responsible for planning, tool invocation, approval pause/resume, and follow-up context. The static `/assistant/` route in this repository is a deterministic interaction and visual acceptance fixture; it does not impersonate a live LLM session.

## AI Elements mapping

When this intent is ported into the live Eve/Next application, install the components through the AI Elements CLI rather than recreating them:

```sh
npx ai-elements@latest add conversation message confirmation tool prompt-input
```

Map the design as follows:

- left message stream → `Conversation` + `Message` + `MessageResponse`
- approval card → `Confirmation`
- tool trace / state → `Tool`
- chat composer → `PromptInput`

The approval UI is a product requirement, not decoration. `run_experiment` must remain approval-gated in the live agent.

## Acceptance

`tests/eve-chat-intent.test.mjs` checks the interaction contract. `tests/eve_chat_browser.py` renders the intent and product route at a real HTTP origin, stores snapshots under `docs/qa/`, performs pixel diff for initial / approved / mobile states, and validates the approval/tool sequence.
