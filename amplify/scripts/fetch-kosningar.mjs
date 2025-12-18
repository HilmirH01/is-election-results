import fs from "node:fs/promises";

const INPUT = "data/source/kosningar.px.json";
const OUTPUT = "data/source/kosningar.raw.json";

// Þetta URL þarf að vera nákvæmlega API endpoint fyrir töfluna.
// Þú getur notað sama og þú prófaðir áðan. Ef það klikkar, sjá Leið 2.
const URL =
  "https://px.hagstofa.is:443/pxis/api/v1/is/Ibuar/kosningar/althingi/althurslit/KOS02121.px";

async function main() {
  const txt = await fs.readFile(INPUT, "utf8");
  const obj = JSON.parse(txt);

  // PX-API vill yfirleitt bara queryObj (ekki wrapperinn).
  const body = obj.queryObj ?? obj;

  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const outTxt = await res.text();

  if (!res.ok) {
    console.error("HTTP", res.status, res.statusText);
    console.error(outTxt.slice(0, 500));
    process.exit(1);
  }

  await fs.writeFile(OUTPUT, outTxt, "utf8");
  console.log(`Wrote ${OUTPUT} (${outTxt.length} chars)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
