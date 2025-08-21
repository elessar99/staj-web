
import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Router from './router/Router'
import Login from './views/login'
import Loading from './views/loading'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import AdminBar from './components/AdminBar'


function App() {
  const dispatch = useDispatch()

  const [control, setControl] = useState(true)
  const [loading, setLoading] = useState(true)

  const login = async ()=>{
    setLoading(true)
    setControl(false)
    try {
      const response = await axios.get('http://localhost:5000/api/protected/me',{
          withCredentials: true
        } );
      setControl(true)
      dispatch({ type: "SET_USER", payload: response.data.user})
      setLoading(false)
    } catch (error) {
      console.log(error.response.data.error)
      setControl(false)
      setLoading(false)
    }
  }
  useEffect(() => {
    login()
  }, [])
  

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false)
  //   }, 1)
  //   return () => clearTimeout(timer)
  // }, [])

  if (loading) {
    return (
      <div className='appbody'>
        <Loading />
      </div>
    )
  }
  if (!control){
    return (
      <div className='appbody'>
        <Login/>
      </div>
    )
  }
  return (
    <div className='appbody'>
      <>
        <Navbar />
        <Router />
      </>
    </div>
  )
}

export default App
