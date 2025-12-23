import { useEffect, useMemo, useState } from "react";
import "./App.css";

import PieChart from "./components/PieChart.jsx";
import PartyLogo from "./components/PartyLogo.jsx";

import { partyColor } from "./library/colors";
import { formatPct } from "./library/format";
import { TOTAL_CONSTITUENCY as TOTAL } from "./library/constants";

export default function App() {
  const [national, setNational] = useState(null);
  const [constData, setConstData] = useState(null);

  const [year, setYear] = useState(null);
  const [view, setView] = useState("bars"); // bars | pie
  const [constituency, setConstituency] = useState(TOTAL);

  useEffect(() => {
    async function loadNationalData() {
      const response = await fetch("/results.json", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setNational(data);

      if (data.years?.length) {
        const newestYear = Number(data.years[data.years.length - 1]);
        setYear(newestYear);
      }
    }

    async function loadConstituencyData() {
      const response = await fetch("/results-kjordaemi.json", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setConstData(data);
    }

    loadNationalData();
    loadConstituencyData();
  }, []);

  const constituencies = useMemo(() => {
    const list = constData?.constituencies ?? [];
    return [TOTAL, ...list];
  }, [constData]);

  const rows = useMemo(() => {
    if (!year) return [];

    if (constituency === TOTAL) {
      if (!national) return [];
      return (national.results ?? [])
        .filter((r) => Number(r.year) === Number(year))
        .slice()
        .sort((a, b) => b.percent - a.percent);
    }

    if (!constData) return [];
    return (constData.results ?? [])
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
          <p className="sub">Hlutfallsleg skipting (%) — Hagstofa Íslands</p>
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
              {!national?.years?.length ? <option value="">Hleður…</option> : null}
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
                        style={{ width: `${w}%`, background: partyColor(r.party) }}
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
