import { MapPinned } from "lucide-react";

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <MapPinned size={22} />
        </div>

        <div>
          <h1>Utility Navigator</h1>
          <p>Nearby Utility & Navigation System</p>
        </div>
      </div>
    </header>
  );
}