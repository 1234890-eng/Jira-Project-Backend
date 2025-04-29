import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [data, setData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const changeHandler = e => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submitHandler = e =>{
    e.preventDefault();
    axios.post('http://localhost:3000/register',data).then(
        res => {alert(res.data);setData({
            userName:'',
            email:'',
            password:'',
            confirmPassword:''
        })}
    )

}

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={submitHandler}>
        <h2>Jira Tool</h2>
        <input
          type="text"
          name="userName"
          placeholder="Enter your name"
          onChange={changeHandler}
        />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          onChange={changeHandler}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
