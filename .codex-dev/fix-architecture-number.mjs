import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const JSZip = require("jszip");

const [sourcePath, outputPath] = process.argv.slice(2);
const zip = await JSZip.loadAsync(await fs.readFile(sourcePath));
let xml = await zip.file("ppt/slides/slide4.xml").async("string");
xml = xml.replace(/3\. Database, Storage &amp; Automation/g, "4. Database, Storage &amp; Automation");
zip.file("ppt/slides/slide4.xml", xml);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, await zip.generateAsync({ type: "nodebuffer" }));
