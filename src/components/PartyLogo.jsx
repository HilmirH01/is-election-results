import { resolveLogo } from "../library/logos";

export default function PartyLogo({ party }) {
  const file = resolveLogo(party);

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
      <div className="logoFallbackText">{party?.[0]?.toUpperCase() ?? "?"}</div>
    </div>
  );
}
