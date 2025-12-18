import fs from "node:fs/promises";
import path from "node:path";

const INPUT = "amplify/data/source/kosningar.raw.json";
const OUTPUT = "public/results.json";

function isMissing(v) {
  return v === null || v === undefined || v === "." || v === "..";
}

async function main() {
  const ds = JSON.parse(await fs.readFile(INPUT, "utf8"));

  // json-stat2
  const ids = ds.id;         // t.d. ["Atriði","Flokkur","Ár"]
  const sizes = ds.size;     // t.d. [1, 21, 8]
  const values = ds.value;   // flat array

  const dim = ds.dimension;

  // Finna röð vídda
  const iAtr = ids.indexOf("Atriði");
  const iParty = ids.indexOf("Flokkur");
  const iYear = ids.indexOf("Ár");

  if (iParty === -1 || iYear === -1) {
    throw new Error(`Vænti víddunum "Flokkur" og "Ár" í json-stat2, fann: ${ids.join(", ")}`);
  }

  // Category keys (í sömu röð og index notar)
  const partyKeys = Object.keys(dim["Flokkur"].category.index)
    .sort((a, b) => dim["Flokkur"].category.index[a] - dim["Flokkur"].category.index[b]);

  const yearKeys = Object.keys(dim["Ár"].category.index)
    .sort((a, b) => dim["Ár"].category.index[a] - dim["Ár"].category.index[b]);

  const partyLabel = dim["Flokkur"].category.label;
  const yearLabel = dim["Ár"].category.label;

  // Reikna offset/multipliers fyrir flat array index
  const mult = [];
  for (let k = ids.length - 1, m = 1; k >= 0; k--) {
    mult[k] = m;
    m *= sizes[k];
  }

  const results = [];

  for (let p = 0; p < partyKeys.length; p++) {
    for (let y = 0; y < yearKeys.length; y++) {
      // Atriði er bara 1 gildi, tökum 0
      const idxParts = new Array(ids.length).fill(0);
      idxParts[iParty] = p;
      idxParts[iYear] = y;

      const flatIndex = idxParts.reduce((acc, v, k) => acc + v * mult[k], 0);
      const v = values[flatIndex];

      if (isMissing(v)) continue;

      const party = partyLabel[partyKeys[p]] ?? partyKeys[p];
      const year = Number(yearLabel[yearKeys[y]] ?? yearKeys[y]);

      results.push({ year, party, percent: Number(v) });
    }
  }

  // Top 9 per ár
  const byYear = {};
  for (const r of results) (byYear[r.year] ??= []).push(r);

  const finalResults = [];
  for (const year of Object.keys(byYear)) {
    finalResults.push(...byYear[year].sort((a,b) => b.percent - a.percent).slice(0, 9));
  }

  const output = {
    years: Object.keys(byYear).map(Number).sort((a,b) => a-b),
    results: finalResults
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2), "utf8");
  console.log(`✔ Wrote ${OUTPUT} (${finalResults.length} rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
