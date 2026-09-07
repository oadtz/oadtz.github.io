import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Preserve the existing GitHub Pages build and stage only public files for Sites.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, "dist");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of [
  "index.html",
  "profile.jpg",
  "favicon.svg",
  "favicon.png",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
]) {
  await cp(join(root, file), join(output, file));
}
// Include only bundles referenced by the current build, including lazy chunks.
const assets = new Set();
async function copyReferences(content) {
  for (const match of content.matchAll(
    /(?:\/assets\/|\.\/)([A-Za-z0-9_-]+\.(?:js|css))/g,
  )) {
    const name = match[1];
    if (assets.has(name)) continue;
    assets.add(name);
    const source = join(root, "assets", name);
    await cp(source, join(output, "assets", name));
    await copyReferences(await readFile(source, "utf8"));
  }
}
await mkdir(join(output, "assets"), { recursive: true });
await copyReferences(await readFile(join(root, "index.html"), "utf8"));
await cp(join(root, "photos"), join(output, "photos"), { recursive: true });
await cp(join(root, "flappybird"), join(output, "flappybird"), {
  recursive: true,
  filter: (source) => source !== join(root, "flappybird", "src"),
});
// A private review copy should not compete with the canonical public website.
await writeFile(join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log(`Staged portfolio and arcade with ${assets.size} current bundles.`);
