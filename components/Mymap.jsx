import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import axios from 'axios';
import markerIcon from '../src/assets/plane.jpg'; // Custom marker icon image

export default function MapComponent() {
  const [markers, setMarkers] = useState([]); // State to hold the marker overlays
  const [zoomLevel, setZoomLevel] = useState(5); // State to hold the zoom level
  const [center, setCenter] = useState(fromLonLat([73.0479, 33.6844])); // State to hold the center

  useEffect(() => {
    const fetchData = () => {
      axios
        .get('https://opensky-network.org/api/states/all?lamin=22.366332&lomin=59.990530&lamax=38.355442&lomax=75.997067')
        .then((response) => {
          const data = response.data.states;
          console.log(data);
          const newMarkers = data.map((item) => {
            const [longitude, latitude] = [item[5], item[6]];
            const marker = new Overlay({
              position: fromLonLat([longitude, latitude]),
              positioning: 'center-center',
              element: document.createElement('div'),
              stopEvent: false,
            });
            marker.getElement().innerHTML = `<img src=${markerIcon} style="width: 30px; height: 30px;"> <label>${item[1]}</label>`; // Add the label to the marker element
            return marker;
          });
          setMarkers(newMarkers);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    
    fetchData();
    const interval = setInterval(fetchData, 10000); // Call the API every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const mapRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: center,
        zoom: zoomLevel,
      }),
    });

    // Add the marker overlays to the map
    markers.forEach((marker) => {
      map.addOverlay(marker);
    });

    // Update the zoom level state when the map is zoomed
    map.on('moveend', () => {
      const newZoomLevel = map.getView().getZoom();
      if (newZoomLevel !== zoomLevel) {
        setZoomLevel(newZoomLevel);
      }
      const newCenter = map.getView().getCenter();
      if (newCenter !== center) {
        setCenter(newCenter);
      }
    });

    return () => {
      map.setTarget(null);
    };
  }, [markers]);
 
  return (
    <div style={{ width: '1280px', height: '650px' }}>
      <div ref={mapRef} className="rounded-4" style={{ width: '100%', height: '100%' }} />
    </div>
  );

}