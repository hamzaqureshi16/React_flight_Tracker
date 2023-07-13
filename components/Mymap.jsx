import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

export default function MapComponent() {
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
        center: [73.0479, 33.6844],
        zoom: 5,
      }),
    });

    return () => {
      map.setTarget(null);
    };
  }, []);

  return <div ref={mapRef} className="rounded-4" style={{ width: '1280px', height: '650px' }} />;
}