import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* =======================
   Utils
======================= */
function slug(s) {
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

function formatPct(x) {
  /* Íslenskt snið */
  return `${x.toFixed(1).replace(".", ",")}%`;
}

/* =======================
   Colors & Logos
======================= */
const PARTY_COLORS = {
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
  "Regnboginn": "#8120bb",
  "Landsbyggðarflokkurinn": "#91a6d1",
  "Dögun": "#e3a538",
  "Flokkur heimilanna": "#35bbed",
  "Hægri grænir": "#2d7400",
  "Lýðræðisvaktin": "#3b5a9a",
};

const PARTY_LOGOS = {
  "Samfylkingin": "/logos/samfylkingin.png",
  "Sjálfstæðisflokkur": "/logos/sjalfstaedisflokkur.png",
  "Viðreisn": "/logos/vidreisn.png",
  "Framsóknarflokkur": "/logos/framsokn.png",
  "Miðflokkurinn": "/logos/midflokkurinn.png",
  "Flokkur fólksins": "/logos/flokkur_folksins.svg",
  "Píratar": "/logos/piratar.png",
  "Sósíalistaflokkur Íslands": "/logos/sosialistaflokkur.png",
  "Vinstrihreyfingin - grænt framboð": "/logos/vg.png",
  "Björt framtíð": "/logos/bjort_framtid.png",
  "Borgarahreyfingin": "/logos/borgarahreyfingin.png",
  "Frjálslyndi flokkurinn": "/logos/frjalslyndi.jpg",
  "Nýtt afl": "/logos/nytt_afl.jpeg",
  "Íslandshreyfingin": "/logos/islandshreyfingin.png",
  "Lýðræðisflokkur": "/logos/lydraedisflokkur.png",
  "Lýðræðishreyfingin": "/logos/lydraedishreyfingin.png",
  "Regnboginn": "/logos/regnboginn.jpg",
  "Landsbyggðarflokkurinn": "/logos/landsbyggdarflokkurinn.jpg",
  "Dögun": "/logos/dogun.png",
  "Flokkur heimilanna": "/logos/flokkur_heimilanna.png",
  "Hægri grænir": "logos/haegri_graenir.png",
  "Lýðræðisvaktin": "/logos/lydraedisvaktin.png",
};

function partyColor(name) {
  return PARTY_COLORS[name] ?? "#64748b";
}

function PartyLogo({ party }) {
  const file = PARTY_LOGOS[party] ?? `/logos/${slug(party)}.png`;

  return (
    <div className="logoWrap" title={party}>
      <img
        className="logoImg"
        src={file}
        alt={party}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement?.classList.add("logoFallback");
        }}
      />
      <div className="logoFallbackText">
        {party?.[0]?.toUpperCase() ?? "?"}
      </div>
    </div>
  );
}

/* =======================
   Pie chart
======================= */
function PieChart({ rows }) {
  const total = rows.reduce((s, r) => s + r.percent, 0);
  if (!rows.length || total <= 0) {
    return <div className="empty">Engin gögn.</div>;
  }

  const size = 320;
  const r = 120;
  const cx = size / 2;
  const cy = size / 2;

  let angle = -Math.PI / 2;
  const slices = rows.map((row) => {
    const a = (row.percent / total) * Math.PI * 2;
    const start = angle;
    const end = angle + a;
    angle = end;

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = a > Math.PI ? 1 : 0;

    return {
      key: row.party,
      d: `
        M ${cx} ${cy}
        L ${x1} ${y1}
        A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `,
      color: partyColor(row.party),
      party: row.party,
      percent: row.percent,
    };
  });

  return (
    <div className="pieLayout">
      <svg width={size} height={size} className="pie">
        {slices.map((s) => (
          <path key={s.key} d={s.d} fill={s.color} />
        ))}
        <circle cx={cx} cy={cy} r={70} fill="#fff" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="pieTotalLabel">
          Samtals
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" className="pieTotalValue">
          {formatPct(total)}
        </text>
      </svg>

      <div className="legend">
        {rows.map((r) => (
          <div key={r.party} className="legendRow">
            <span
              className="swatch"
              style={{ background: partyColor(r.party) }}
            />
            <span className="legendName">{r.party}</span>
            <span className="legendPct">{formatPct(r.percent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =======================
   App
======================= */
export default function App() {
  const TOTAL = "Landsheild";
  const [national, setNational] = useState(null);
  const [constData, setConstData] = useState(null);
  const [year, setYear] = useState(null);
  const [view, setView] = useState("bars"); // bars | pie
  const [constituency, setConstituency] = useState(TOTAL);


  useEffect(() => {
    async function loadNationalData() {
      const response = await fetch("/results.json", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json();
        setNational(data);

        if (data.years?.length) {
          const newestYear = Number(data.years[data.years.length - 1]);
          setYear(newestYear)
        }
      }
    }

    async function loadConstituencyData() {
      const response = await fetch("/results-kjordaemi.json", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json();
        setConstData(data);
      }
    }

    loadNationalData()
    loadConstituencyData();
  },[]);

  
  const constituencies = useMemo(() => {
    const list = constData?.constituencies ?? [];
    return [TOTAL, ...list];
  }, [constData]);

  const rows = useMemo(() => {
    if (!year) return [];

    if (constituency === TOTAL) {
      const data = national;
      if (!data) return [];
      return (data.results ?? [])
        .filter((r) => Number(r.year) === Number(year))
        .slice()
        .sort((a, b) => b.percent - a.percent);
    }

    const data = constData;
    if (!data) return [];

    return (data.results ?? [])
      .filter((r) => Number(r.year) === Number(year))
      .filter((r) => r.constituency === constituency)
      .slice()
      .sort((a, b) => b.percent - a.percent);
  }, [national, constData, year, constituency]);


  const max = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => r.percent)) : 0),
    [rows]
  );

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Úrslit alþingiskosninga</h1>
          <p className="sub">
            Hlutfallsleg skipting (%) — Hagstofa Íslands
          </p>
        </div>

        <div className="controls">
          <label className="label">
            Ár
            <select
              className="select"
              value={year == null ? "" : String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={!national?.years?.length}
            >
              {!national?.years?.length ? (
                <option value="">Hleður…</option>
              ) : null}

              {(national?.years ?? []).map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </label>


          <label className="label">
            Kjördæmi
            <select
              className="select"
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
            >
              {constituencies.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            Sýn
            <div className="segmented">
              <button
                className={`segBtn ${view === "bars" ? "active" : ""}`}
                onClick={() => setView("bars")}
              >
                Stöplar
              </button>
              <button
                className={`segBtn ${view === "pie" ? "active" : ""}`}
                onClick={() => setView("pie")}
              >
                Skífa
              </button>
            </div>
          </label>
        </div>
      </header>

      <div className="card">
        {view === "bars" ? (
          <div className="list">
            {rows.map((r) => {
              const w = max ? (r.percent / max) * 100 : 0;
              return (
                <div key={r.party} className="row">
                  <PartyLogo party={r.party} />
                  <div className="content">
                    <div className="titleLine">
                      <div className="partyName">{r.party}</div>
                      <div className="pct">{formatPct(r.percent)}</div>
                    </div>
                    <div className="barTrack">
                      <div
                        className="barFill"
                        style={{
                          width: `${w}%`,
                          background: partyColor(r.party),
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <PieChart rows={rows} />
        )}
      </div>
    </div>
  );
}