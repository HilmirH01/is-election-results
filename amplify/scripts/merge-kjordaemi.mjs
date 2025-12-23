import fs from "node:fs/promises";
import path from "node:path";

const OUT = "public/results-kjordaemi.json";
const INPUTS_PERCENT = [
  "amplify/data/export/kjordaemi-2003.normalized.json",
  "amplify/data/export/kjordaemi-2007.normalized.json",
  "amplify/data/export/kjordaemi-2009.normalized.json",
  "amplify/data/export/kjordaemi-2013.normalized.json",
  "amplify/data/export/kjordaemi-2016.normalized.json",
  "amplify/data/export/kjordaemi-2017.normalized.json",
  "amplify/data/export/kjordaemi-2021.normalized.json",
  "amplify/data/export/kjordaemi-2024.normalized.json",
];

const INPUTS_SEATS = [
  "amplify/data/export/kjordaemi-seats-2003.normalized.json",
  "amplify/data/export/kjordaemi-seats-2007.normalized.json",
  "amplify/data/export/kjordaemi-seats-2009.normalized.json",
  "amplify/data/export/kjordaemi-seats-2013.normalized.json",
  "amplify/data/export/kjordaemi-seats-2016.normalized.json",
  "amplify/data/export/kjordaemi-seats-2017.normalized.json",
  "amplify/data/export/kjordaemi-seats-2021.normalized.json",
  "amplify/data/export/kjordaemi-seats-2024.normalized.json",
];

function keyOf(r) {
  return `${r.year}__${r.constituency}__${r.party}`;
}

async function readResults(file) {
  const obj = JSON.parse(await fs.readFile(file, "utf8"));
  return obj.results ?? [];
}

function isMissing(v) {
  return v === null || v === undefined || v === "." || v === "..";
}

async function main() {
  const percentAll = [];
  for (const f of INPUTS_PERCENT) percentAll.push(...(await readResults(f)));

  const seatsAll = [];
  for (const f of INPUTS_SEATS) seatsAll.push(...(await readResults(f)));

  // Map seats by key
  const seatsMap = new Map();
  for (const r of seatsAll) {
    if (isMissing(r.seats)) continue;
    seatsMap.set(keyOf(r), Number(r.seats));
  }

  // Dedupe percent (last wins)
  const percentMap = new Map();
  for (const r of percentAll) percentMap.set(keyOf(r), r);

  // Merge seats into percent rows
  const merged = [];
  for (const r of percentMap.values()) {
    merged.push({
      ...r,
      seats: seatsMap.get(keyOf(r)) ?? null,
    });
  }


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
