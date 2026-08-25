const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const utilityConfig = {
  hospital: {
    query: `nwr["amenity"="hospital"]`,
    defaultName: "Hospital",
  },

  police: {
    query: `nwr["amenity"="police"]`,
    defaultName: "Police Station",
  },

  toilet: {
    query: `nwr["amenity"="toilets"]`,
    defaultName: "Public Toilet",
  },

  railway: {
    query: `nwr["railway"="station"]`,
    defaultName: "Railway Station",
  },
};

export async function fetchNearbyUtilities(
  type,
  latitude,
  longitude,
  radius = 10000
) {
  const config = utilityConfig[type];

  if (!config) {
    throw new Error(`Unsupported utility type: ${type}`);
  }

  const query = `
    [out:json][timeout:25];

    (
      ${config.query}(around:${radius},${latitude},${longitude});
    );

    out center tags;
  `;

  const response = await fetch(
    `${OVERPASS_URL}?data=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(
      `Overpass request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.elements
    .map((element) => {
      const lat =
        element.lat ??
        element.center?.lat;

      const lon =
        element.lon ??
        element.center?.lon;

      if (
        typeof lat !== "number" ||
        typeof lon !== "number"
      ) {
        return null;
      }

      return {
        id: `${element.type}-${element.id}`,

        osmId: element.id,

        latitude: lat,
        longitude: lon,

        name:
          element.tags?.name ||
          element.tags?.["name:en"] ||
          config.defaultName,

        address: buildAddress(
          element.tags
        ),

        tags: element.tags || {},
      };
    })
    .filter(Boolean);
}

function buildAddress(tags = {}) {
  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  if (addressParts.length === 0) {
    return "Address unavailable";
  }

  return addressParts.join(", ");
}