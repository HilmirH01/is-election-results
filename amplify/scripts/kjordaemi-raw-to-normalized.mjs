import fs from "node:fs/promises";
import path from "node:path";

const INPUT = process.argv[2];   // t.d. amplify/data/source/kjordaemi-2007.raw.json
const OUTPUT = process.argv[3];  // t.d. amplify/data/export/kjordaemi-2007.normalized.json
const YEAR_FALLBACK = process.argv[4] ? Number(process.argv[4]) : null;
const METRIC_FIELD = process.argv[5] ?? "percent"; // "percent" | "seats"

function orderedKeys(dimObj) {
  const idx = dimObj.category.index;
  return Object.keys(idx).sort((a, b) => idx[a] - idx[b]);
}

async function main() {
  if (!INPUT || !OUTPUT) {
    console.error("Usage: node kjordaemi-raw-to-normalized.mjs <input.raw.json> <output.normalized.json> [yearFallback]");
    process.exit(1);
  }

  const ds = JSON.parse(await fs.readFile(INPUT, "utf8"));

  const ids = ds.id;        // ["Ár","Eining","Kjördæmi","Flokkur"]
  const sizes = ds.size;    // [1,1,6,10]
  const values = ds.value;
  const dim = ds.dimension;

  const iYear = ids.indexOf("Ár");
  const iConst = ids.indexOf("Kjördæmi");
  const iParty = ids.indexOf("Flokkur");
  const iAtr = ids.indexOf("Atriði"); 

  if (iConst === -1 || iParty === -1) {
    throw new Error(`Vantar víddir. Fann: ${ids.join(", ")}`);
  }
  if (iYear === -1 && !YEAR_FALLBACK) {
    throw new Error('Engin "Ár" vídd og ekkert yearFallback gefið.');
  }

  const mult = [];
  for (let k = ids.length - 1, m = 1; k >= 0; k--) {
    mult[k] = m;
    m *= sizes[k];
  }

  const results = [];

  const yearKeys = iYear !== -1 ? orderedKeys(dim["Ár"]) : [null];
  const constKeys = orderedKeys(dim["Kjördæmi"]);
  const partyKeys = orderedKeys(dim["Flokkur"]);

  const yearLabel = iYear !== -1 ? dim["Ár"].category.label : null;
  const constLabel = dim["Kjördæmi"].category.label;
  const partyLabel = dim["Flokkur"].category.label;

  for (let yi = 0; yi < yearKeys.length; yi++) {
    for (let ci = 0; ci < constKeys.length; ci++) {
      for (let pi = 0; pi < partyKeys.length; pi++) {
        const idxParts = new Array(ids.length).fill(0);

        if (iYear !== -1) idxParts[iYear] = yi;
        if (iAtr !== -1) idxParts[iAtr] = 0; // Atriði er bara 1 gildi í query
        idxParts[iConst] = ci;
        idxParts[iParty] = pi;

        const flatIndex = idxParts.reduce((acc, v, k) => acc + v * mult[k], 0);
        const v = values[flatIndex];

        if (v === null || v === "." || v === ".." || v === undefined) continue;

        const year =
          iYear !== -1
            ? Number(yearLabel[yearKeys[yi]] ?? yearKeys[yi])
            : YEAR_FALLBACK;

        const constituency = constLabel[constKeys[ci]] ?? constKeys[ci];
        const party = partyLabel[partyKeys[pi]] ?? partyKeys[pi];

        const metricValue = Number(v);

        results.push({
        year,
        constituency,
        party,
        [METRIC_FIELD]: METRIC_FIELD === "seats" ? Math.round(metricValue) : metricValue
        });

      }
    }
  }


  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify({ results }, null, 2), "utf8");
  console.log(`✔ Wrote ${OUTPUT} (${results.length} rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
