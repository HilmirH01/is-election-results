import fs from "node:fs/promises";
import path from "node:path";

const INPUT = "amplify/data/source/kjordaemi.raw.json";
const OUTPUT = "public/results-kjordaemi.json";

function getOrderedKeys(dimObj) {
  const idx = dimObj.category.index;
  return Object.keys(idx).sort((a, b) => idx[a] - idx[b]);
}

async function main() {
  const ds = JSON.parse(await fs.readFile(INPUT, "utf8"));

  // json-stat2 structure
  const ids = ds.id;       // e.g. ["Ár","Eining","Kjördæmi","Flokkur"]
  const sizes = ds.size;   // size per dim
  const values = ds.value; // flat array
  const dim = ds.dimension;

  const iYear = ids.indexOf("Ár");
  const iConst = ids.indexOf("Kjördæmi");
  const iParty = ids.indexOf("Flokkur");

  if (iYear === -1 || iConst === -1 || iParty === -1) {
    throw new Error(`Vantar víddir. Fann: ${ids.join(", ")}`);
  }

  // multipliers for flat indexing
  const mult = [];
  for (let k = ids.length - 1, m = 1; k >= 0; k--) {
    mult[k] = m;
    m *= sizes[k];
  }

  const yearKeys = getOrderedKeys(dim["Ár"]);
  const constKeys = getOrderedKeys(dim["Kjördæmi"]);
  const partyKeys = getOrderedKeys(dim["Flokkur"]);

  const yearLabel = dim["Ár"].category.label;
  const constLabel = dim["Kjördæmi"].category.label;
  const partyLabel = dim["Flokkur"].category.label;

  const results = [];

  for (let yi = 0; yi < yearKeys.length; yi++) {
    for (let ci = 0; ci < constKeys.length; ci++) {
      for (let pi = 0; pi < partyKeys.length; pi++) {
        const idxParts = new Array(ids.length).fill(0);
        idxParts[iYear] = yi;
        idxParts[iConst] = ci;
        idxParts[iParty] = pi;

        const flatIndex = idxParts.reduce((acc, v, k) => acc + v * mult[k], 0);
        const v = values[flatIndex];

        if (v === null || v === "." || v === ".." || v === undefined) continue;

        const year = Number(yearLabel[yearKeys[yi]] ?? yearKeys[yi]);
        const constituency = constLabel[constKeys[ci]] ?? constKeys[ci];
        const party = partyLabel[partyKeys[pi]] ?? partyKeys[pi];

        results.push({ year, constituency, party, percent: Number(v) });
      }
    }
  }

  // Top 9 per (year, constituency)
  const buckets = {};
  for (const r of results) {
    const k = `${r.year}__${r.constituency}`;
    (buckets[k] ??= []).push(r);
  }

  const finalResults = [];
  for (const k of Object.keys(buckets)) {
    finalResults.push(...buckets[k].sort((a, b) => b.percent - a.percent).slice(0, 9));
  }

  const out = {
    years: [...new Set(finalResults.map(r => r.year))].sort((a,b)=>a-b),
    constituencies: [...new Set(finalResults.map(r => r.constituency))],
    results: finalResults
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`✔ Wrote ${OUTPUT} (${finalResults.length} rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
