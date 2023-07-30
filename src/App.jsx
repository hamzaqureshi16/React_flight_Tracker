import {Fragment , useEffect} from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import MyMap from '../components/Mymap'


function App() { 

  useEffect(() => {
    document.title = "Flight Tracker"
    console.log(import.meta.env)
  }, [])


  return (
    <Fragment>
    <MyMap/>
    </Fragment>
   
  )
}

export default App
