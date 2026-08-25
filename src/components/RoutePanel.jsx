import {
  Clock3,
  MapPin,
  Navigation,
  Route,
  X,
} from "lucide-react";

export default function RoutePanel({
  route,
  destination,
  onClose,
  navigationStarted,
  onStartNavigation,
}) {
  if (!route || !destination) {
    return null;
  }

  return (
    <div className="route-panel">

      <div className="route-panel-header">

        <div>
          <span className="route-label">
            NAVIGATING TO
          </span>

          <h2>
            {destination.name}
          </h2>

          <p>
            <MapPin size={13} />
            {destination.address}
          </p>
        </div>

        <button
          className="route-close"
          onClick={onClose}
        >
          <X size={18} />
        </button>

      </div>

      <div className="route-stats">

        <div>
          <Route size={19} />

          <span>
            <strong>
              {formatDistance(
                route.distance
              )}
            </strong>

            Distance
          </span>
        </div>

        <div>
          <Clock3 size={19} />

          <span>
            <strong>
              {formatDuration(
                route.duration
              )}
            </strong>

            Estimated Time
          </span>
        </div>

      </div>

      {
!navigationStarted && (

<button
className="start-navigation-button"
onClick={onStartNavigation}
>

<Navigation size={18}/>

Start Navigation

</button>

)
}

      <div className="direction-heading">
        <Navigation size={17} />

        Route Guidance
      </div>

      <div className="direction-list">

        {route.steps.map(
          (step, index) => (
            <div
              className="direction-item"
              key={index}
            >

              <div className="direction-number">
                {index + 1}
              </div>

              <div className="direction-content">

                <strong>
                  {createInstruction(
                    step
                  )}
                </strong>

                <span>
                  {formatDistance(
                    step.distance
                  )}
                </span>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}

function createInstruction(step) {
  const maneuver =
    step.maneuver || {};

  const road =
    step.name ||
    "the road";

  const direction =
    maneuver.modifier || "";

  switch (maneuver.type) {
    case "depart":
      return `Start on ${road}`;

    case "arrive":
      return "You have arrived at your destination";

    case "turn":
      return `Turn ${direction} onto ${road}`;

    case "continue":
      return `Continue ${direction} on ${road}`;

    case "new name":
      return `Continue onto ${road}`;

    case "merge":
      return `Merge ${direction} onto ${road}`;

    case "fork":
      return `Keep ${direction} onto ${road}`;

    case "roundabout":
      return `Enter the roundabout towards ${road}`;

    case "rotary":
      return `Enter the roundabout towards ${road}`;

    default:
      return road
        ? `Continue on ${road}`
        : "Continue";
  }
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(
      meters
    )} m`;
  }

  return `${(
    meters / 1000
  ).toFixed(1)} km`;
}

function formatDuration(seconds) {
  const minutes =
    Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  return `${hours} hr ${remainingMinutes} min`;
}