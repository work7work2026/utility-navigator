import { Layers3, Map, Satellite, Sun } from "lucide-react";

const basemaps = [
  {
    id: "osm",
    name: "Street",
    icon: Map,
  },
  {
    id: "satellite",
    name: "Satellite",
    icon: Satellite,
  },
  {
    id: "light",
    name: "Light",
    icon: Sun,
  },
];

export default function BasemapSwitcher({
  open,
  setOpen,
  activeBasemap,
  onChange,
}) {
  return (
    <div className="basemap-wrapper">
      <button
        className="map-control-button"
        onClick={() => setOpen(!open)}
      >
        <Layers3 size={18} />
        Basemap
      </button>

      {open && (
        <div className="basemap-panel">
          <div className="panel-title">Basemap</div>

          {basemaps.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`basemap-option ${
                  activeBasemap === item.id ? "active" : ""
                }`}
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
              >
                <Icon size={17} />
                {item.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}