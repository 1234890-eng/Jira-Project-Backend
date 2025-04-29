import React, { useState, useContext, useEffect } from 'react';
import { store } from './App';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Myprofile = () => {
  const [token, setToken] = useContext(store);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (token) {
      console.log("Token being sent:", token);

      axios.get('http://localhost:3000/myprofile', {
        headers: {
          'x-token': token
        }
      })
      .then(res => setData(res.data))
      .catch(err => console.log(err));
    }
  }, [token]);

  if (!token) {
    return <Navigate to='/login' />;
  }

  return (
    <div>
      {data?.userName && (
        <center>
          Welcome to the Jira Tool: {data.userName}
        </center>
      )}
    </div>
  );
};

export default Myprofile;

