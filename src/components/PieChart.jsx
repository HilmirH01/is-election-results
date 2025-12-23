import { partyColor } from "../library/colors";
import { formatPct } from "../library/format";

export default function PieChart({ rows }) {
  const total = rows.reduce((s, r) => s + r.percent, 0);
  if (!rows.length || total <= 0) return <div className="empty">Engin gögn.</div>;

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
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: partyColor(row.party),
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
          Samtals - Top 9
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" className="pieTotalValue">
          {formatPct(total)}
        </text>
      </svg>

      <div className="legend">
        {rows.map((r) => (
          <div key={r.party} className="legendRow">
            <span className="swatch" style={{ background: partyColor(r.party) }} />
            <span className="legendName">{r.party}</span>
            <span className="legendPct">{formatPct(r.percent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
