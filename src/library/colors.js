export const PARTY_COLORS = {
  Samfylkingin: "#d32f2f",
  "Miðflokkurinn": "#0b2e6b",
  "Sjálfstæðisflokkur": "#00a3e0",
  Viðreisn: "#ff7a00",
  Framsóknarflokkur: "#0b6b3a",
  Píratar: "#6c5ce7",
  "Vinstrihreyfingin - grænt framboð": "#00b894",
  "Flokkur fólksins": "#f4b400",
  "Sósíalistaflokkur Íslands": "#e74c3c",
  "Björt framtíð": "#951281",
  "Borgarahreyfingin": "#f3781f",
  "Frjálslyndi flokkurinn": "#0057a4",
  "Nýtt afl": "#7b6d64",
  "Íslandshreyfingin": "#70b400",
  "Lýðræðisflokkur": "#004180",
  "Lýðræðishreyfingin": "#8b3036",
  Regnboginn: "#8120bb",
  Landsbyggðarflokkurinn: "#91a6d1",
  Dögun: "#e3a538",
  "Flokkur heimilanna": "#35bbed",
  "Hægri grænir": "#2d7400",
  "Lýðræðisvaktin": "#3b5a9a",
};

export function partyColor(name) {
  return PARTY_COLORS[name] ?? "#64748b";
}
