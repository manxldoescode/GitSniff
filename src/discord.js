// Discord embed color
const SEVERITY_COLORS = {
  patch: 0x57f287, // green
  minor: 0xfee75c, // yellow
  major: 0xed4245, // red
};

const SEVERITY_LABELS = {
  patch: "🟢 Patch",
  minor: "🟡 Minor",
  major: "🔴 Major",
};

const EVENT_ICONS = {
  push: "📦",
  pr: "🔀",
};

//sending the response to my discord webhook
export async function sendDiscordNotif(diffData, summary) {
  const webHookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webHookUrl) throw new Error("DISCORD_WEBHOOK is not set");

  const embed = buildEmbed(diffData, summary);

  const response = await fetch(webHookUrl, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed : ${response.status} ${text}`);
  }
}

function buildEmbed(diffData, summary) {
  const severity = summary.severity || "patch";
  const icon = EVENT_ICONS[diffData.type];
  const repo = process.env.REPO;

  const title =
    diffData.type === "pr"
      ? `${icon} PR #${diffData.prNumber} merged — ${diffData.title}`
      : `${icon} Push to main — ${diffData.message.split("\n")[0].slice(0, 60)}`;

  // Components as inline code tags
  const componentStr = summary.components?.length
    ? summary.components.map((c) => `\`${c}\``).join(", ")
    : "`unknown`";

  // Highlights as bullet list
  const highlightStr = summary.highlights?.length
    ? summary.highlights.map((h) => `• ${h}`).join("\n")
    : null;

  // File stats
  const fileStr = diffData.files
    .slice(0, 8)
    .map((f) => {
      const icon = fileStatusIcon(f.status);
      return `${icon} \`${f.filename}\``;
    })
    .join("\n");

  const extraFiles =
    diffData.files.length > 8
      ? `\n_...and ${diffData.files.length - 8} more_`
      : "";

  const fields = [
    {
      name: "Summary",
      value: summary.summary || "No summary available.",
      inline: false,
    },
    {
      name: "Components",
      value: componentStr,
      inline: true,
    },
    {
      name: "Severity",
      value: SEVERITY_LABELS[severity] || SEVERITY_LABELS.patch,
      inline: true,
    },
    {
      name: "Changes",
      value: `+${diffData.totalAdditions} / -${diffData.totalDeletions} lines`,
      inline: true,
    },
  ];

  if (highlightStr) {
    fields.push({ name: "Highlights", value: highlightStr, inline: false });
  }

  fields.push({
    name: "Files Changed",
    value: fileStr + extraFiles || "none",
    inline: false,
  });

  return {
    title: title.slice(0, 256),
    color: SEVERITY_COLORS[severity] || SEVERITY_COLORS.patch,
    url: diffData.url,
    fields,
    footer: {
      text: `${repo} • ${diffData.author}`,
    },
    timestamp: new Date().toISOString(),
  };
}

function fileStatusIcon(status) {
  switch (status) {
    case "added":
      return "➕";
    case "removed":
      return "➖";
    case "modified":
      return "✏️";
    case "renamed":
      return "🔄";
    default:
      return "📄";
  }
}
