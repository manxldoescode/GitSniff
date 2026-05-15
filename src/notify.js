import { getPushDiff, getPRDiff } from "./github.js";
import { summarizeDiff } from "./llm.js";
import { sendDiscordNotification } from "./discord.js";

// Hardcoded config for testing
const MIN_LINES_CHANGED = 1;
const IGNORE_PATHS = ["package-lock.json", "yarn.lock"];

function shouldSkip(diffData) {
  const totalLines = diffData.totalAdditions + diffData.totalDeletions;
  if (totalLines < MIN_LINES_CHANGED) return true;

  const meaningfulFiles = diffData.files.filter(
    (f) => !IGNORE_PATHS.some((p) => f.filename.endsWith(p)),
  );
  return meaningfulFiles.length === 0;
}

async function main() {
  const eventName = process.env.EVENT_NAME;
  console.log(`🔔 Running Discord notifier for event: ${eventName}`);

  // Fetch diff data from GitHub API
  let diffData;
  if (eventName === "push") {
    diffData = await getPushDiff();
  } else if (eventName === "pull_request") {
    diffData = await getPRDiff();
  } else {
    console.log("Unsupported event, skipping.");
    return;
  }

  console.log(
    `📂 ${diffData.files.length} files changed (+${diffData.totalAdditions}/-${diffData.totalDeletions})`,
  );

  if (shouldSkip(diffData)) {
    console.log(
      "⏭️  Skipping notification (below threshold or ignored paths).",
    );
    return;
  }

  console.log("🤖 Summarizing with gpt-4o-mini...");
  const summary = await summarizeDiff(diffData);
  console.log(`✅ Summary: ${summary.summary}`);

  console.log("📨 Sending to Discord...");
  await sendDiscordNotification(diffData, summary);
  console.log("🎉 Done!");
}

main().catch((err) => {
  console.error("❌ Notifier failed:", err.message);
  process.exit(1);
});
