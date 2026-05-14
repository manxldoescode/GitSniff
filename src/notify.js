async function main() {
  const eventName = process.env.EVENT_NAME;
  console.log(`Running discord notifier on ${eventName}`);

  //fetch the data from GitHub API
  let diffdata;
  if (eventName === "push") {
    diffdata = getPushData();
  } else if (eventName === "pull_request") {
    diffdata = getPullData();
  } else {
    console.error(`Event not supported, stopping!`);
    return;
  }

  console.log(`${diffdata.files.length} files changed`);

  //Initiating the AI pipeline
  console.log(`Starting the Summarized`);
  const summary = await SummarizeChange(diffdata);
  console.log(`Summary : ${summary.summary}`);

  //Posting to discord;
  console.log(`Sending the Summary to discord`);
  await SendToDiscord(diffdata, summary);
}

main().catch((err) => {
  console.error("Notifier Failed : ", err.message);
  process.exit(1);
});
