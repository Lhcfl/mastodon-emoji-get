import fs from "fs";
import path from "path";
import process from "node:process";

const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".apng"];

let [DIRNAME, CATEGORY, PERFIX] = process.argv.slice(2);
if (!DIRNAME) {
  console.log(`
SCRIPT TO MAKE meta.json
=========================

USAGE: node make_meta.mjs [dirname] [?emoji_category_name] [?emoji_prefix]
`
);
  process.exit(0);
}
if (!CATEGORY) {
  CATEGORY = path.basename(DIRNAME);
}

const files = fs.readdirSync(DIRNAME);

const emojis = [];
for (const fileName of files) {
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    console.log("Skip", fileName, "because its ext is not allowed");
    continue;
  }
  const emojiName = (PERFIX ? PERFIX + "_" : "") + path.basename(fileName, ext).replaceAll(".", "_");
  emojis.push({
    downloaded: true,
    fileName,
    emoji: {
      name: emojiName,
      category: CATEGORY,
      aliases: [],
    },
  });
}

const metajson = {
  metaVersion: 2,
  host: "mastodon-emoji-getter",
  exportedAt: new Date(),
  emojis,
};

fs.writeFileSync(DIRNAME + "/meta.json", JSON.stringify(metajson, undefined, 2));

console.log("Sucessfully generated meta.json for", DIRNAME);