import { useState } from "react";
import "./login.css"
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, setLogin] = useState({
    email : "",
    password: "",
    isAdmin: false
  })
  
  const [register, setRegister] = useState({
    email : "",
    userName: "",
    password: ""
  })

  const fetchLogin = async (e)=>{
    e.preventDefault();
    try{
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        login,
        {
          withCredentials: true
        }        
      );
      console.log(response)
      dispatch({ type: "SET_USER", payload: response.data});
      navigate("/");
      window.location.reload()
    } catch (error){
      console.log("Error fatchLogin: ", error.response.data.error);
    }
  }
  const fetchRegister = async (e)=>{
    e.preventDefault();
    try{
      const response = await axios.post('http://localhost:5000/api/auth/register',register);
      console.log(response)
      dispatch({ type: "SET_USER", payload: response.data});
      window.location.reload();
    } catch (error){
      console.log("Error fatchLogin: ", error.response.data.error);
    }
  }



  return (
    <>
      <div className="pageBody">
          <form onSubmit={fetchLogin} className="loginForm">
            <div className="form">
              <div>
                E-mail: {login.email}
              </div>
              <input className="loginInput" type="mail" placeholder="mail" 
              onChange={(e)=>{setLogin({...login,email:e.target.value})}} value={login.email}/>
            </div>
            
            <div className="form">
              <div>
                şifre: {login.password}
              </div>
              <input className="loginInput" type="password" placeholder="password" 
              onChange={(e)=>{setLogin({...login,password:e.target.value})}} value={login.password}/>
            </div>

            <button type="submit" className="loginBtn" >
              Login
            </button>
          </form>

          
          <form onSubmit={fetchRegister} className="loginForm">
            <div className="form">
              <div>
                E-mail: {register.email}
              </div>
              <input className="loginInput" type="mail" placeholder="mail" 
              onChange={(e)=>{setRegister({...register,email:e.target.value})}} value={register.email}/>
            </div>

            <div className="form">
              <div>
                User: {register.userName}
              </div>
              <input  className="loginInput" type="text" placeholder="User" 
              onChange={(e)=>{setRegister({...register,userName:e.target.value})}} value={register.userName}/>
            </div>
            
            <div className="form">
              <div>
                şifre: {register.password}
              </div>
              <input className="loginInput" type="password" placeholder="password" 
              onChange={(e)=>{setRegister({...register,password:e.target.value})}} value={register.password}/>
            </div>

            <button className="loginBtn" type="submit">
              Register
            </button>
          </form>
      </div>
    </>

  );
}
export default Login;