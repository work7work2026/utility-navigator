import {
  Hospital,
  Shield,
  Accessibility,
  TrainFront,
  X,
} from "lucide-react";

const utilities = [
  {
    id: "hospital",
    label: "Hospital",
    icon: Hospital,
  },
  {
    id: "police",
    label: "Police Station",
    icon: Shield,
  },
  {
    id: "toilet",
    label: "Public Toilet",
    icon: Accessibility,
  },
  {
    id: "railway",
    label: "Railway Station",
    icon: TrainFront,
  },
];

export default function UtilitySelector({
  open,
  onClose,
  selectedUtility,
  onSelect,
}) {
  if (!open) return null;

  return (
    <div className="utility-panel">
      <div className="utility-header">
        <div>
          <span>Nearby Search</span>
          <h3>Select Utility</h3>
        </div>

        <button className="close-button" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="utility-grid">
        {utilities.map((utility) => {
          const Icon = utility.icon;

          return (
            <button
              key={utility.id}
              className={`utility-card ${
                selectedUtility === utility.id ? "active" : ""
              }`}
              onClick={() => onSelect(utility.id)}
            >
              <div className="utility-icon">
                <Icon size={21} />
              </div>

              <span>{utility.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}