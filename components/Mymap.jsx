import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import axios from 'axios';
import markerIcon from '../src/assets/plane.png'; // Custom marker icon image
import { toast, ToastContainer } from 'react-toastify';
import { transformExtent } from 'ol/proj';
import { useCallback } from 'react';

export default function MapComponent() {
  const [markers, setMarkers] = useState([]); // State to hold the marker overlays
  const [zoomLevel, setZoomLevel] = useState(5); // State to hold the zoom level
  const [center, setCenter] = useState(fromLonLat([73.0479, 33.6844])); // State to hold the center
  const [extent, setExtent] = useState([ 43.604540625000006, 17.786665521455063, 102.491259375, 47.11223396185369 ]);
  const [queryType, setQueryType] = useState(0); 
  const [query, setQuery] = useState('');

  useEffect(()=>{
    console.log("extent",extent)
  },[extent])

  useEffect(()=>{
    fetchData();
  },[])

  const fetchData = useCallback(async () => {
    const username = `${import.meta.env.VITE_OPENSKY_USERNAME}`;
    const password = `${import.meta.env.VITE_OPENSKY_PASSWORD}}`;
    const credentials = `${username}:${password}`;
    const basicAuthHeader = `Basic ${btoa(credentials)}`;
    console.log('api call')
    const url = `https://opensky-network.org/api/states/all?lomin=${extent[0]}&lomax=${extent[2]}&lamin=${extent[1]}&lamax=${extent[3]}`;
    if(query === ''){
      await axios.get(url, {
        headers: {
          Authorization: basicAuthHeader,
        },
      }).then((response) => {
          const data = response.data.states;
          console.log(data)
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
            label.textContent = `${item[1]}`;
  
            //make an icao label
            const icaoLabel = document.createElement('label');
            icaoLabel.textContent = `ICAO: ${item[0]}`;
            icaoLabel.style.display = 'none';
            marker.getElement().appendChild(icaoLabel);
            
            
  
            marker.getElement().onmouseover = function () {
              icaoLabel.style.display = 'block';
            };
            marker.getElement().onmouseout = function () {
              icaoLabel.style.display = 'none';
            };
  
  
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
    }
    else{
        handleSearch();
    }
  }, [extent, query]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, import.meta.env.MODE === 'development' ? 25000 : 25000);
  
    return () => clearInterval(interval);
  }, [extent, fetchData]);

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
      const newExtent = map.getView().calculateExtent(map.getSize());
      if (newExtent !== extent) {
        const transformedExtent = transformExtent(newExtent, 'EPSG:3857', 'EPSG:4326');
        setExtent(transformedExtent);
      }
    });

    return () => {
      map.setTarget(null);
    };
  }, [markers]);

  const handleSearch = async () =>{

    console.log('in handle search')
    const username = `${import.meta.env.VITE_OPENSKY_USERNAME}`;
    const password = `${import.meta.env.VITE_OPENSKY_PASSWORD}}`;
    const credentials = `${username}:${password}`;
    const basicAuthHeader = `Basic ${btoa(credentials)}`;
    await axios.get('https://opensky-network.org/api/states/all',{
      headers: {
        Authorization: basicAuthHeader,
      },
    }).then((response) => {
      let data = response.data.states;

      let result = data.find((item)=>{
        return item[queryType] === query
      }
      )
      console.log(result)

      if(result){
        const [longitude, latitude, heading] = [result[5], result[6], result[10]];
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
          label.textContent = `${result[1]} 
          ICAO: ${result[0]} 
          Altitude: ${result[7]} ft 
          Velocity: ${result[9]} m/s 
          Vertical Rate: ${result[11]} m/s 
          Callsign: ${result[1]}
          `;

          label.style.display = 'none';

          marker.getElement().onmouseover = function () {
            label.style.display = 'block';
          };
          marker.getElement().onmouseout = function () {
            label.style.display = 'none';
          };

          marker.getElement().appendChild(img);
          marker.getElement().appendChild(label);
          img.src = markerIcon;
          img.style.width = '30px';
          img.style.height = '30px';
          img.style.transform = `rotate(${heading}deg)`; // Rotate the image based on the heading value
          // const label = document.createElement('label');
          marker.getElement().appendChild(img);
          marker.getElement().appendChild(label);


          setMarkers([marker]);
          setCenter(fromLonLat([longitude, latitude]));
      }
    })
    .catch((error) => {
      console.log('Error fetching data from OpenSky API');

      console.log(error);
    }
    )


  }

 
  return (
    <>
      <div className="search-container  " style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px',
        marginLeft:'2vw', 
        zIndex: '1', 
        backgroundColor:'transparent' 
        }}
      >
        
        <select 
          name="querytype" 
          id="querytype" 
          className='rounded-5 p-2 col-3 col-md-2 m-1' 
          onChange={(e)=>{
          setQueryType(e.target.value)
          }}
          value={queryType}
        >

          <option 
            value={0}
          >
            ICAO24
          </option>

          <option 
            value={1}
          >
            Callsign(not working currently)
          </option>

          

        </select>

        <input 
          type="text" 
          placeholder="Search... " 
          className='rounded-5 p-2 col-6 col-md-3 m-1' 
          value={query} 
          onChange={(e)=>{
            setQuery(e.target.value)
          }}
        />

        <input 
          type="button" 
          value="Search" 
          className='rounded-5 p-2 col-5 col-md-2 m-1' 
          onClick={handleSearch}
        />

      <input 
        type='button'
        value='Clear Search'
        className='rounded-5 p-2 col-4 col-md-2 m-1'
        onClick={()=>{
          setQuery('')
          setQueryType(0)
          setMarkers([])
          setExtent(extent);
          fetchData();
        }}

        />

      </div>

      <div 
        ref={mapRef} 
        className="d-flex rounded-4" 
        style={{ 
          padding: "0px", 
          margin: '0px', 
          width: '100vw', 
          height: '100vh', 
          borderRadius: '20px' 
        }} 
      />
    </>
  );

}