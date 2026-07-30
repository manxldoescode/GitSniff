<div align="center">

# GitSniff

AI-powered GitHub change summaries delivered to Discord.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-enabled-2088FF?logo=github-actions&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-webhook-5865F2?logo=discord&logoColor=white)

</div>

---

## Overview

GitSniff is a lightweight GitHub Actions notifier that summarizes repository changes and sends them to Discord.

When a push is made to the main branch, GitSniff fetches commit data from GitHub, analyzes the changed files with GitHub Models, and sends a clean Discord embed with a short summary, affected components, severity, and file changes.

## Features

- Monitors push events from GitHub Actions
- Fetches commit and changed-file data using Octokit
- Summarizes code changes using GitHub Models
- Sends formatted Discord webhook notifications
- Classifies changes as patch, minor, or major
- Skips small or lockfile-only changes
- Pull request support planned

## Project Structure

| File | Purpose |
| --- | --- |
| `notify.js` | Main workflow runner |
| `github.js` | Fetches GitHub commit data |
| `llm.js` | Generates AI summaries |
| `discord.js` | Sends Discord embeds |
| `discord-notify.yml` | GitHub Actions workflow |

## Requirements

- Node.js 20+
- GitHub Actions
- Discord webhook URL
- GitHub token with `contents: read` and `models: read`

## Setup

Install dependencies:

`npm install`

Add this repository secret in GitHub Actions:

| Secret | Description |
| --- | --- |
| `DISCORD_WEBHOOK_URL` | Webhook URL for the target Discord channel |

The workflow provides the required runtime values such as `GITHUB_TOKEN`, `COMMIT_SHA`, `EVENT_NAME`, `REPO`, and commit metadata.

## Workflow

GitSniff runs through the following process:

1. GitHub Actions detects a push.
2. Commit data is fetched from the GitHub API.
3. The changed files are summarized by GitHub Models.
4. A structured embed is sent to Discord.

## Status

GitSniff currently supports push notifications. Merged pull request summaries are planned for a future version.

## Security

Do not commit webhook URLs, GitHub tokens, or other credentials. Store sensitive values in GitHub Actions secrets.
