export function GET() {
  return Response.json({
    app: "business-world-model-eve",
    runtime: "vercel-eve",
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });
}
