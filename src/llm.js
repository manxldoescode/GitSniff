import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
  defaultHeaders: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});
export async function summarizeDiff(diffData) {
  const prompt = buildPrompt(diffData);

  const response = await openai.chat.completions.create({
    model: "openai/gpt-4.1",
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a code change summarizer for a developer Discord server.
    Analyze git diffs and return ONLY valid JSON — no markdown, no explanation, no backticks.
    Be concise but informative. Developers are your audience.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0]?.message.content || " ";

  try {
    return JSON.parse(text.trim());
  } catch {
    return {
      summary: "Changes were pushed to the repository.",
      components: ["unknown"],
      highlights: [],
      severity: "patch",
    };
  }
}

function buildPrompt(diffData) {
  const fileList = diffData.files
    .map(
      (f) =>
        `${f.status.toUpperCase()} ${f.filename} (+${f.additions}/-${f.deletions})`,
    )
    .join("\n");

  const patches = diffData.files
    .filter((f) => f.patch)
    .slice(0, 5)
    .map((f) => `--- ${f.filename} ---\n${f.patch}`)
    .join("\n\n");

  const context =
    diffData.type === "pr"
      ? `PR #${diffData.prNumber}: "${diffData.title}"\nDescription: ${diffData.body?.slice(0, 300) || "none"}\nAuthor: ${diffData.author}`
      : `Commit ${diffData.sha}: "${diffData.message}"\nAuthor: ${diffData.author}`;

  return `${context}

Changed files (${diffData.files.length} total, +${diffData.totalAdditions}/-${diffData.totalDeletions} lines):
${fileList}

Diffs:
${patches || "No patch data available."}

Return a JSON object with exactly these fields:
{
  "summary": "1-2 sentence plain English summary of what changed and why",
  "components": ["array", "of", "affected", "components", "or", "modules"],
  "highlights": ["key change 1", "key change 2"],
  "severity": "patch | minor | major"
}

severity guide: patch = fixes/docs/style, minor = new feature or refactor, major = breaking change or large feature`;
}
