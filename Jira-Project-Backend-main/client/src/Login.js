import React, { useState,useContext } from 'react';
import axios from 'axios';
import './Login.css';
import {store} from './App'
import {Navigate} from 'react-router'


const Login = () => {
    const [token,setToken]=useContext(store);
  const [data, setData] = useState({
    email: '',
    password: '',
  });

  const changeHandler = e => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submitHandler = e => {
    e.preventDefault();
    axios.post('http://localhost:3000/login', data).then(
        res => setToken(res.data.token)
    );
  };
  if(token){
       return <Navigate to = '/myprofile'/>
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={submitHandler}>
        <h2>Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={changeHandler}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          onChange={changeHandler}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
