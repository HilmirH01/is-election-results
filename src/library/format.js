export function slug(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[áàâä]/g, "a")
    .replace(/[ð]/g, "d")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/[þ]/g, "th")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPct(x) {
  return `${Number(x).toFixed(1).replace(".", ",")}%`;
}
