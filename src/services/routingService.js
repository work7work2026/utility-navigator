const OSRM_BASE_URL =
  "https://router.project-osrm.org";

export async function getRoute(
  start,
  destination
) {
  const coordinates =
    `${start.longitude},${start.latitude};` +
    `${destination.longitude},${destination.latitude}`;

  const url =
    `${OSRM_BASE_URL}/route/v1/driving/${coordinates}` +
    `?overview=full` +
    `&geometries=geojson` +
    `&steps=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Routing request failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (
    data.code !== "Ok" ||
    !data.routes?.length
  ) {
    throw new Error(
      "No road route found."
    );
  }

  const route = data.routes[0];

  return {
    geometry: route.geometry,

    distance: route.distance,

    duration: route.duration,

    steps:
      route.legs?.flatMap(
        (leg) => leg.steps || []
      ) || [],
  };
}