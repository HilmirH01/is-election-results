import fs from "node:fs/promises";
import path from "node:path";

const INPUT_PERCENT = "amplify/data/source/kosningar.raw.json";
const INPUT_SEATS = "amplify/data/source/kosningar-seats.raw.json";
const OUTPUT = "public/results.json";

function isMissing(v) {
  return v === null || v === undefined || v === "." || v === "..";
}

function orderedKeys(dimObj) {
  const idx = dimObj.category.index;
  return Object.keys(idx).sort((a, b) => idx[a] - idx[b]);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

function parseNational(ds, mode) {
  // mode: "percent" | "seats"
  const ids = ds.id;
  const sizes = ds.size;
  const values = ds.value;
  const dim = ds.dimension;

  const iAtr = ids.indexOf("Atriði"); // til staðar í KOS02121
  const iParty = ids.indexOf("Flokkur");
  const iYear = ids.indexOf("Ár");

  if (iParty === -1 || iYear === -1) {
    throw new Error(`Vænti "Flokkur" og "Ár", fann: ${ids.join(", ")}`);
  }

  // multipliers
  const mult = [];
  for (let k = ids.length - 1, m = 1; k >= 0; k--) {
    mult[k] = m;
    m *= sizes[k];
  }

  const partyKeys = orderedKeys(dim["Flokkur"]);
  const yearKeys = orderedKeys(dim["Ár"]);

  const partyLabel = dim["Flokkur"].category.label;
  const yearLabel = dim["Ár"].category.label;

  // Atriði: percent/raw voru líklega "1" (prósenta) og seats query er "2"
  // Við gerum ráð fyrir að inputið sé þegar síað í query -> bara eitt atriði,
  // en ef Atriði er samt til staðar í output, tökum alltaf 0.
  const atrIndex = iAtr !== -1 ? 0 : null;

  const rows = [];
  for (let p = 0; p < partyKeys.length; p++) {
    for (let y = 0; y < yearKeys.length; y++) {
      const idxParts = new Array(ids.length).fill(0);
      if (iAtr !== -1) idxParts[iAtr] = atrIndex;
      idxParts[iParty] = p;
      idxParts[iYear] = y;

      const flatIndex = idxParts.reduce((acc, v, k) => acc + v * mult[k], 0);
      const v = values[flatIndex];

      if (isMissing(v)) continue;

      const party = partyLabel[partyKeys[p]] ?? partyKeys[p];
      const year = Number(yearLabel[yearKeys[y]] ?? yearKeys[y]);

      rows.push({
        year,
        party,
        value: mode === "seats" ? Number(v) : Number(v),
      });
    }
  }

  return rows;
}

async function main() {
  const dsPercent = await readJson(INPUT_PERCENT);
  const dsSeats = await readJson(INPUT_SEATS);

  const percentRows = parseNational(dsPercent, "percent");
  const seatRows = parseNational(dsSeats, "seats");

  // indexa seats á (year,party)
  const seatMap = new Map();
  for (const r of seatRows) seatMap.set(`${r.year}__${r.party}`, r.value);

  // sameina inn í percent rows
  const merged = percentRows.map((r) => ({
    year: r.year,
    party: r.party,
    percent: r.value,
    seats: seatMap.get(`${r.year}__${r.party}`) ?? null,
  }));

  // top 9 per ár (eftir prósentu)
  const byYear = {};
  for (const r of merged) (byYear[r.year] ??= []).push(r);

  const finalResults = [];
  for (const year of Object.keys(byYear)) {
    finalResults.push(...byYear[year].sort((a, b) => b.percent - a.percent).slice(0, 9));
  }

  const output = {
    years: Object.keys(byYear).map(Number).sort((a, b) => a - b),
    results: finalResults,
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2), "utf8");
  console.log(`✔ Wrote ${OUTPUT} (${finalResults.length} rows)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
