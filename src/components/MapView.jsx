import {
  useEffect,
  useRef,
  useState,
} from "react";

import Map from "ol/Map";
import View from "ol/View";

import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";

import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";

import Feature from "ol/Feature";

import Point from "ol/geom/Point";

import GeoJSON from "ol/format/GeoJSON";

import {
  fromLonLat,
} from "ol/proj";

import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
} from "ol/style";

import {
  LocateFixed,
  Search,
} from "lucide-react";

import BasemapSwitcher
  from "./BasemapSwitcher";

import UtilitySelector
  from "./UtilitySelector";

import RoutePanel
  from "./RoutePanel";

import {
  fetchNearbyUtilities,
} from "../services/utilityService";

import {
  getRoute,
} from "../services/routingService";

import {
  calculateDistance,
} from "../utils/distance";

import UtilityList
  from "./UtilityList";

/* =====================================
   BASEMAPS
===================================== */

const osmLayer =
  new TileLayer({
    source: new OSM(),
    visible: true,
  });

const satelliteLayer =
  new TileLayer({
    source: new XYZ({
      url:
        "https://server.arcgisonline.com/" +
        "ArcGIS/rest/services/" +
        "World_Imagery/MapServer/" +
        "tile/{z}/{y}/{x}",
    }),

    visible: false,
  });

const lightLayer =
  new TileLayer({
    source: new XYZ({
      url:
        "https://{a-c}.basemaps.cartocdn.com/" +
        "light_all/{z}/{x}/{y}.png",
    }),

    visible: false,
  });


/* =====================================
   COMPONENT
===================================== */

export default function MapView() {

  const mapElement =
    useRef(null);

  const mapRef =
    useRef(null);

    const watchIdRef =
  useRef(null);

  /* =====================================
     VECTOR SOURCES
  ===================================== */

  const locationSource =
    useRef(
      new VectorSource()
    );

  const utilitySource =
    useRef(
      new VectorSource()
    );

  const routeSource =
    useRef(
      new VectorSource()
    );


  /* =====================================
     STATE
  ===================================== */

  const [
    userLocation,
    setUserLocation,
  ] = useState(null);

  const [
    activeBasemap,
    setActiveBasemap,
  ] = useState("osm");

  const [
    basemapOpen,
    setBasemapOpen,
  ] = useState(false);

  const [
    utilityPanelOpen,
    setUtilityPanelOpen,
  ] = useState(false);

  const [
    selectedUtilityType,
    setSelectedUtilityType,
  ] = useState(null);

  const [
    utilities,
    setUtilities,
  ] = useState([]);

  const [
    selectedDestination,
    setSelectedDestination,
  ] = useState(null);

  const [
    route,
    setRoute,
  ] = useState(null);
  const [
  navigationStarted,
  setNavigationStarted,
] = useState(false);

  const [
    status,
    setStatus,
  ] = useState(
    "Get your current location to begin."
  );

  const [
    loading,
    setLoading,
  ] = useState(false);


  /* =====================================
     CREATE MAP
  ===================================== */

  useEffect(() => {

    if (mapRef.current) {
      return;
    }

    const locationLayer =
      new VectorLayer({
        source:
          locationSource.current,

        zIndex: 100,
      });

    const utilityLayer =
      new VectorLayer({
        source:
          utilitySource.current,

        zIndex: 80,
      });

    const routeLayer =
      new VectorLayer({
        source:
          routeSource.current,

        zIndex: 70,
      });


    const map =
      new Map({

        target:
          mapElement.current,

        layers: [

          osmLayer,

          satelliteLayer,

          lightLayer,

          routeLayer,

          utilityLayer,

          locationLayer,

        ],

        view:
          new View({

            center:
              fromLonLat([
                80.9462,
                26.8467,
              ]),

            zoom: 12,

          }),

        controls: [],

      });


    mapRef.current =
      map;


    return () => {

      map.setTarget(
        undefined
      );

      mapRef.current =
        null;

    };

  }, []);


  /* =====================================
     CLICK UTILITY MARKER
  ===================================== */

  useEffect(() => {

    const map =
      mapRef.current;

    if (!map) {
      return;
    }


    const clickHandler =
      (event) => {

        const feature =
          map.forEachFeatureAtPixel(
            event.pixel,

            (clickedFeature) =>
              clickedFeature
          );


        if (!feature) {
          return;
        }


        const utility =
          feature.get(
            "utilityData"
          );


        if (!utility) {
          return;
        }


        calculateAndShowRoute(
          utility
        );

      };


    map.on(
      "singleclick",
      clickHandler
    );


    return () => {

      map.un(
        "singleclick",
        clickHandler
      );

    };

  }, [userLocation]);


  /* =====================================
     CURSOR WHEN HOVERING UTILITY
  ===================================== */

  useEffect(() => {

    const map =
      mapRef.current;

    if (!map) {
      return;
    }


    const pointerHandler =
      (event) => {

        const hit =
          map.hasFeatureAtPixel(
            event.pixel
          );


        map.getTargetElement()
          .style.cursor =
          hit
            ? "pointer"
            : "";

      };


    map.on(
      "pointermove",
      pointerHandler
    );


    return () =>
      map.un(
        "pointermove",
        pointerHandler
      );

  }, []);


  /* =====================================
     BASEMAP
  ===================================== */

  function changeBasemap(id) {

    osmLayer.setVisible(
      id === "osm"
    );

    satelliteLayer.setVisible(
      id === "satellite"
    );

    lightLayer.setVisible(
      id === "light"
    );

    setActiveBasemap(id);

  }


  /* =====================================
     CURRENT LOCATION
  ===================================== */

  function getCurrentLocation() {

  if (!navigator.geolocation) {

    setStatus(
      "Geolocation is not supported."
    );

    return;

  }


  setStatus(
    "Starting live location..."
  );


  const watchId =
    navigator.geolocation.watchPosition(

      (position)=>{


        const location = {

          longitude:
            position.coords.longitude,

          latitude:
            position.coords.latitude,

        };


        setUserLocation(
          location
        );


        displayCurrentLocation(
          location
        );


        setStatus(
          "Live location active."
        );


      },


      (error)=>{

        console.error(
          error
        );


        setStatus(
          "Unable to get live location."
        );

      },


      {

        enableHighAccuracy:
          true,


        timeout:
          10000,


        maximumAge:
          1000,

      }

    );


  watchIdRef.current =
    watchId;

}


  function displayCurrentLocation(
    location
  ) {

    const coordinate =
      fromLonLat([

        location.longitude,

        location.latitude,

      ]);


    locationSource
      .current
      .clear();


    const feature =
      new Feature({

        geometry:
          new Point(
            coordinate
          ),

        featureType:
          "currentLocation",

      });


    feature.setStyle(

      new Style({

        image:
          new CircleStyle({

            radius: 10,

            fill:
              new Fill({
                color:
                  "#2563eb",
              }),

            stroke:
              new Stroke({
                color:
                  "#ffffff",

                width: 4,
              }),

          }),

      })

    );


    locationSource
      .current
      .addFeature(
        feature
      );


    mapRef
      .current
      .getView()
      .animate({

        center:
          coordinate,

        zoom: 15,

        duration: 700,

      });

  }


  /* =====================================
     SELECT UTILITY
  ===================================== */

  async function selectUtility(
    type
  ) {

    if (!userLocation) {

      setStatus(
        "Please click Current Location first."
      );

      return;
    }


    try {

      setLoading(true);

      setSelectedUtilityType(
        type
      );


      setUtilityPanelOpen(
        false
      );


      setStatus(
        `Searching nearby ${getUtilityLabel(
          type
        )}...`
      );


      /* Clear previous data */

      utilitySource
        .current
        .clear();

      routeSource
        .current
        .clear();


      setRoute(null);

      setSelectedDestination(
        null
      );


      /* Fetch utilities */

      const results =
        await fetchNearbyUtilities(

          type,

          userLocation.latitude,

          userLocation.longitude,

          10000

        );


      if (
        results.length === 0
      ) {

        setUtilities([]);

        setStatus(
          `No ${getUtilityLabel(
            type
          )} found within 10 km.`
        );

        return;
      }


      /* Calculate distance */

      const processed =
        results.map(
          (utility) => ({

            ...utility,

            straightDistance:
              calculateDistance(

                userLocation.latitude,

                userLocation.longitude,

                utility.latitude,

                utility.longitude

              ),

          })
        );


      /* nearest first */

      processed.sort(

        (a, b) =>

          a.straightDistance -
          b.straightDistance

      );


      setUtilities(
        processed
      );


      /* Show all */

      displayUtilities(
        processed,
        type
      );


      /* nearest */

      const nearest = processed[0];


setSelectedDestination(
  nearest
);


setStatus(
  `${processed.length} ${getUtilityLabel(
    type
  )} found. Nearest route loaded.`
);


/*
  Draw default route,
  but do not open route guidance panel
*/

await calculateDefaultRoute(nearest);

async function calculateDefaultRoute(
  destination
) {

  if (!userLocation) {
    return;
  }


  try {

    const routeResult =
      await getRoute(
        userLocation,
        destination
      );


    routeSource
      .current
      .clear();


    const routeFeature =
      new GeoJSON()
        .readFeature(
          routeResult.geometry,
          {
            dataProjection:
              "EPSG:4326",

            featureProjection:
              "EPSG:3857",
          }
        );


    routeFeature.setStyle(

      new Style({

        stroke:
          new Stroke({

            color:
              "#1769e0",

            width:
              7,

          }),

      })

    );


    routeSource
      .current
      .addFeature(
        routeFeature
      );


    highlightSelectedUtility(
      destination
    );


  }
  catch(error){

    console.error(
      error
    );

    setStatus(
      "Default route failed."
    );

  }

}

    } catch (error) {

      console.error(
        error
      );


      setStatus(
        "Unable to load nearby utilities."
      );


    } finally {

      setLoading(false);

    }

  }


  /* =====================================
     SHOW UTILITIES
  ===================================== */

  function displayUtilities(
    data,
    type
  ) {

    utilitySource
      .current
      .clear();


    const features =
      data.map(
        (utility) => {


          const feature =
            new Feature({

              geometry:
                new Point(

                  fromLonLat([

                    utility.longitude,

                    utility.latitude,

                  ])

                ),

            });


          feature.set(
            "utilityData",
            utility
          );


          feature.setStyle(
            createUtilityStyle(
              type,
              false
            )
          );


          return feature;

        }
      );


    utilitySource
      .current
      .addFeatures(
        features
      );

  }


  /* =====================================
     UTILITY STYLE
  ===================================== */

  function createUtilityStyle(
    type,
    selected
  ) {

    const colors = {

      hospital:
        "#dc2626",

      police:
        "#2563eb",

      toilet:
        "#7c3aed",

      railway:
        "#ea580c",

    };


    const color =
      colors[type] ||
      "#2563eb";


    return new Style({

      image:
        new CircleStyle({

          radius:
            selected
              ? 12
              : 9,

          fill:
            new Fill({

              color:
                selected
                  ? color
                  : "#ffffff",

            }),

          stroke:
            new Stroke({

              color,

              width:
                selected
                  ? 5
                  : 4,

            }),

        }),

    });

  }


  /* =====================================
     ROUTING
  ===================================== */

  async function calculateAndShowRoute(
    destination
  ) {

    if (!userLocation) {
      return;
    }


    try {

      setStatus(
        `Calculating route to ${destination.name}...`
      );


      const routeResult =
        await getRoute(

          userLocation,

          destination

        );


      /* Clear old route */

      routeSource
        .current
        .clear();


      /* Convert GeoJSON route */

      const routeFeature =
        new GeoJSON()
          .readFeature(

            routeResult.geometry,

            {

              dataProjection:
                "EPSG:4326",

              featureProjection:
                "EPSG:3857",

            }

          );


      routeFeature.setStyle(

        new Style({

          stroke:
            new Stroke({

              color:
                "#1769e0",

              width: 7,

            }),

        })

      );


      routeSource
        .current
        .addFeature(
          routeFeature
        );


      /* Selected marker */

      highlightSelectedUtility(
        destination
      );


      setSelectedDestination(
        destination
      );


      setRoute(
        routeResult
      );


      /* Fit route */

      const extent =
        routeFeature
          .getGeometry()
          .getExtent();


      mapRef
        .current
        .getView()
        .fit(

          extent,

          {

            padding: [
              100,
              100,
              100,
              410,
            ],

            duration:
              700,

            maxZoom:
              17,

          }

        );


      setStatus(
        `Route ready to ${destination.name}.`
      );


    } catch (error) {

      console.error(
        error
      );


      setStatus(
        "Road route could not be calculated."
      );

    }

  }


  /* =====================================
     SELECTED UTILITY STYLE
  ===================================== */

  function highlightSelectedUtility(
    selected
  ) {

    utilitySource
      .current
      .getFeatures()
      .forEach(
        (feature) => {


          const utility =
            feature.get(
              "utilityData"
            );


          if (!utility) {
            return;
          }


          const isSelected =
            utility.id ===
            selected.id;


          feature.setStyle(

            createUtilityStyle(

              selectedUtilityType,

              isSelected

            )

          );

        }
      );

  }


  /* =====================================
     CLOSE ROUTE
  ===================================== */

  function closeRoute() {

    routeSource
      .current
      .clear();


    setRoute(null);

    setSelectedDestination(
      null
    );


    utilitySource
      .current
      .getFeatures()
      .forEach(
        (feature) => {

          feature.setStyle(

            createUtilityStyle(

              selectedUtilityType,

              false

            )

          );

        }
      );


    setStatus(
      "Route cleared. Select another utility marker."
    );

  }

useEffect(()=>{

  return ()=>{

    if(
      watchIdRef.current !== null
    ){

      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

    }

  };

},[]);
  /* =====================================
     UI
  ===================================== */

  return (

    <div className="map-page">


      <div
        ref={mapElement}
        className="map-container"
      />


      {/* Main map buttons */}

      <div className="map-action-buttons">


        <button
          className="primary-map-button"
          onClick={
            getCurrentLocation
          }
        >

          <LocateFixed
            size={18}
          />

          Current Location

        </button>


        <button
          className="secondary-map-button"

          onClick={() =>

            setUtilityPanelOpen(
              !utilityPanelOpen
            )

          }
        >

          <Search
            size={18}
          />

          Utility Select

        </button>


      </div>


      {/* Basemap */}

      <BasemapSwitcher

        open={
          basemapOpen
        }

        setOpen={
          setBasemapOpen
        }

        activeBasemap={
          activeBasemap
        }

        onChange={
          changeBasemap
        }

      />


      {/* Utility selector */}

      <UtilitySelector

        open={
          utilityPanelOpen
        }

        selectedUtility={
          selectedUtilityType
        }

        onClose={() =>
          setUtilityPanelOpen(
            false
          )
        }

        onSelect={
          selectUtility
        }

      />

      <UtilityList

        utilities={
          utilities
        }

        selectedDestination={
          selectedDestination
        }

        onSelect={
          calculateAndShowRoute
        }

      />


      {/* Routing */}

      <RoutePanel
 route={route}
 destination={selectedDestination}
 navigationStarted={navigationStarted}
 onStartNavigation={() =>
   setNavigationStarted(true)
 }
 onClose={closeRoute}
/>


      {/* Status */}

      <div className="map-status">

        {loading
          ? "Searching..."
          : status}

      </div>


      {/* Count */}

      {utilities.length > 0 && (

        <div className="utility-count">

          <strong>
            {utilities.length}
          </strong>

          nearby{" "}

          {getUtilityLabel(
            selectedUtilityType
          )}

        </div>

      )}


    </div>

  );

}


/* =====================================
   LABEL
===================================== */

function getUtilityLabel(type) {

  const labels = {

    hospital:
      "Hospitals",

    police:
      "Police Stations",

    toilet:
      "Public Toilets",

    railway:
      "Railway Stations",

  };


  return (
    labels[type] ||
    "Utilities"
  );

}