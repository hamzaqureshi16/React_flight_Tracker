import {Fragment , useEffect} from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import MyMap from '../components/Mymap'
import plane from './assets/plane.png'

function App() { 

  useEffect(() => {
    document.title = "Flight Tracker" 
     //set window icon
     const link = document.querySelector("link[rel~='icon']");
     if (!link) {
       const link = document.createElement('link');
       link.rel = 'icon';
       link.href = plane;
       document.head.appendChild(link);
     }else{
       link.href = plane;
     }


  }, [])


  return (
    <Fragment>
    <MyMap/>
    </Fragment>
   
  )
}

export default App
