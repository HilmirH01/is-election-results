import fs from "node:fs/promises";
import path from "node:path";

const OUT = "public/results-kjordaemi.json";
const INPUTS = [
  "amplify/data/export/kjordaemi-2003.normalized.json",
  "amplify/data/export/kjordaemi-2007.normalized.json",
  "amplify/data/export/kjordaemi-2009.normalized.json",
  "amplify/data/export/kjordaemi-2013.normalized.json",
  "amplify/data/export/kjordaemi-2016.normalized.json",
  "amplify/data/export/kjordaemi-2017.normalized.json",
  "amplify/data/export/kjordaemi-2021.normalized.json",
  "amplify/data/export/kjordaemi-2024.normalized.json",

];

function keyOf(r) {
  return `${r.year}__${r.constituency}__${r.party}`;
}

async function readResults(file) {
  const obj = JSON.parse(await fs.readFile(file, "utf8"));
  return obj.results ?? [];
}

async function main() {
  const all = [];
  for (const f of INPUTS) {
    all.push(...(await readResults(f)));
  }

  // dedupe (seinasta vinnur ef sama lykill)
  const map = new Map();
  for (const r of all) map.set(keyOf(r), r);

  const merged = [...map.values()];

  // top 9 per (year,constituency)
  const buckets = {};
  for (const r of merged) {
    const k = `${r.year}__${r.constituency}`;
    (buckets[k] ??= []).push(r);
  }

  const finalResults = [];
  for (const k of Object.keys(buckets)) {
    finalResults.push(...buckets[k].sort((a, b) => b.percent - a.percent).slice(0, 9));
  }

  const years = [...new Set(finalResults.map(r => r.year))].sort((a,b)=>a-b);
  const constituencies = [...new Set(finalResults.map(r => r.constituency))];

  const out = { years, constituencies, results: finalResults };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`✔ Wrote ${OUT} (${finalResults.length} rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
