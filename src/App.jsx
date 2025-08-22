import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import axios from 'axios';
import ApplicationList from './components/ApplicationList';

function App() {
  //useState hook for storing data
  const[applications, setApplications] = useState([]);

  //useEffect for fetching data from API
  useEffect(() => {
    axios.get('http://localhost:3000/applications')
    .then(response => {
      setApplications(response.data);
    })
    .catch(error => {
      console.error('Error fetching applications:', error);
    });
  }, []);

    return (
    <div>
      <Header />
      <h1>Applications:</h1>
      <ApplicationList applications={applications} />
    </div>
  )
}

export default App
