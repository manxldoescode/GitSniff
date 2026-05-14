import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = process.env.split("/");

export async function getPushData() {
  const sha = process.env.COMMIT_SHA;

  const { data } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  const files = data.files || [];

  return {
    type: "push",
    sha: sha.slice(0, 7),
    fullSha: sha,
    message: process.env.COMMIT_MESSAGE || data.commit.message,
    author: process.env.PUSHER_NAME || data.commit.author?.name || "unknown",
    url: data.html_url,
    files: files.map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
    })),
  };
}

//IMPLEMENT GET PULL DATA -> SOON
