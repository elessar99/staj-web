import axios from "axios";
import { useDispatch } from "react-redux";
import UserCard from "../cards/userCard";
import { useEffect } from "react";
import { useState } from "react";
import NotUserCard from "../cards/notUserCard";
import "./authorization.css"

const Authorization = () => {
  const [userVerificationBtn, setUserVerificationBtn] = useState(false)
  const [users, setUsers] = useState([])
  const [noneVerifiedUsers, setNoneVerifiedUsers] = useState([])
  const dispatch = useDispatch();

  const toggleUserVerification = () => {
    setUserVerificationBtn(!userVerificationBtn);
  };

  const getNoneVerifiedUsers = async ()=>{
    try{
      const response = await axios.get(
        'http://localhost:5000/api/admin/noneVerifiedUsers',
        {
          withCredentials: true,
          credentials: 'include'
        }
      );
      setNoneVerifiedUsers(response.data)
      console.log(response)
    } catch (error){
      console.log("Error: ", error.response);
    }
  }

  const getUsers = async ()=>{
    try{
      const response = await axios.get(
        'http://localhost:5000/api/admin/users',
        {
          withCredentials: true,
          credentials: 'include'
        }      
      );
      setUsers(response.data)
      console.log(response)
    } catch (error){
      console.log("Error: ", error.response);
    }
  }
  useEffect(() => {
    getUsers()
    getNoneVerifiedUsers()
  }, [])
  
  
  return (
    <>
        <div className="userVerificationBtn" onClick={toggleUserVerification}>User Verification</div>
          {userVerificationBtn && (<div>
              {noneVerifiedUsers.length > 0 ? (
                  <div className="User-list">
                      {noneVerifiedUsers.map((user) => (
                          <NotUserCard key={user._id} userId={user._id} email={user.email} permissions={user.permissions} isAdmin={user.isAdmin} userName={user.userName}/>
                      ))}
                  </div>
              ) : (
                  <p style={{color:"black"}}>No unapproved users found</p>
              )}
        </div>)}
        <div style={{marginTop:"30px"}}>
              {users.length > 0 ? (
                  <div className="User-list">
                      {users.map((user) => (
                          <UserCard key={user._id} userId={user._id} email={user.email} permissions={user.permissions} isAdmin={user.isAdmin} userName={user.userName}/>
                      ))}
                  </div>
              ) : (
                  <p style={{color:"black"}}>No users found</p>
              )}
        </div>
    </>
  );
}
export default Authorization;