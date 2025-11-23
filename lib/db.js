import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data");

export function ensureDataFolder() {
  if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });
}

export function readJSON(filename) {
  ensureDataFolder();
  const file = path.join(dataPath, filename);
  if (!fs.existsSync(file)) {
    // create default empty structure
    if (filename === "items.json") fs.writeFileSync(file, "[]", "utf8");
    else if (filename === "categories.json") fs.writeFileSync(file, "[]", "utf8");
    else fs.writeFileSync(file, "[]", "utf8");
  }
  const data = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export function writeJSON(filename, data) {
  ensureDataFolder();
  const file = path.join(dataPath, filename);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}
