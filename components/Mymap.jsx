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
import { toast, ToastContainer } from 'react-toastify';

export default function MapComponent() {
  const [markers, setMarkers] = useState([]); // State to hold the marker overlays
  const [zoomLevel, setZoomLevel] = useState(5); // State to hold the zoom level
  const [center, setCenter] = useState(fromLonLat([73.0479, 33.6844])); // State to hold the center

  useEffect(() => {
    console.log(import.meta.env)
  }
  ,[])

  useEffect(() => {
    const fetchData = async () => {
      const username = `${import.meta.env.VITE_OPENSKY_USERNAME}`;
      const password = `${import.meta.env.VITE_OPENSKY_PASSWORD}}`;
      const credentials = `${username}:${password}`;
      const basicAuthHeader = `Basic ${btoa(credentials)}`;

      const url = 'https://opensky-network.org/api/states/all';
      await axios.get(url, {
        headers: {
          Authorization: basicAuthHeader,
        },
      }).then((response) => {
          const data = response.data.states;
          console.log(data);
          const newMarkers = data.map((item) => {
            const [longitude, latitude, heading] = [item[5], item[6], item[10]];
            const marker = new Overlay({
              position: fromLonLat([longitude, latitude]),
              positioning: 'center-center',
              element: document.createElement('div'),
              stopEvent: false,
            });
            const img = document.createElement('img');
            img.src = markerIcon;
            img.style.width = '30px';
            img.style.height = '30px';
            img.style.transform = `rotate(${heading}deg)`; // Rotate the image based on the heading value
            const label = document.createElement('label');
            label.textContent = item[1];
            marker.getElement().appendChild(img);
            marker.getElement().appendChild(label);
            img.src = markerIcon;
            img.style.width = '30px';
            img.style.height = '30px';
            img.style.transform = `rotate(${heading}deg)`; // Rotate the image based on the heading value
            // const label = document.createElement('label');
            label.textContent = item[1];
            marker.getElement().appendChild(img);
            marker.getElement().appendChild(label);
            return marker;
          });
          setMarkers(newMarkers);
        })
        .catch((error) => {
          toast.error('Error fetching data from OpenSky API');

          console.log(error);
        });
    };

    
    fetchData();
    const interval = setInterval(fetchData, 25000); // Call the API every 25 seconds
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
    <>
    
    <div style={{ width: '1280px', height: '650px', border:'2px solid black', borderRadius:"20px" }}>  
      <div ref={mapRef} className="rounded-4" style={{ width: '100%', height: '100%', borderRadius:'20px' }} />
    </div>
    </>
  );

}