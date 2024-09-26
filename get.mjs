import Downloader from "nodejs-file-downloader";
const API = "/api/v1/custom_emojis";

let [INSTANCE, CATEGORY, DIRNAME] = process.argv.slice(2);
if (!INSTANCE || !CATEGORY) {
  console.log(`
SCRIPT TO GET CUSTOM EMOJIS FROM A MASTODON INSTANCE
=========================

USAGE: node get.mjs [instance url] [emoji_category] [?dirname]

EXAMPLE: node get.mjs mastodon.social blobcat
`);
  process.exit(0);
}
if (!INSTANCE.startsWith("https")) {
  INSTANCE = "https://" + INSTANCE;
}
if (INSTANCE.endsWith("/")) {
  INSTANCE = INSTANCE.slice(0, INSTANCE.length - 1);
}
if (!DIRNAME) {
  DIRNAME = CATEGORY;
}

const res = await fetch(INSTANCE + API, {
  headers: {
    Accept: "application/json",
  },
}).then((res) => res.json());

const failed = [];
for (const emoji of res) {
  if (emoji.category === CATEGORY) {
    const url = emoji.url;
    const code = emoji.shortcode;
    console.log("Downloading", code, "from", url);
    const downloader = new Downloader({
      url,
      directory: DIRNAME,
    });
    await downloader
      .download()
      .then(({ filePath }) => {
        console.log("OK, downloaded at", filePath);
      })
      .catch((err) => {
        console.warn("Oops! download failed!");
        console.error(err);
        failed.push({ code, url, err });
      });
    await new Promise((r) => setTimeout(r, 300));
  } else {
    console.log("Skip", emoji.shortcode);
  }
}
console.log("All Downloaded!");
if (failed.length > 0) {
  console.log(failed.length, "emojis download failed:");
  console.error(failed);
}
