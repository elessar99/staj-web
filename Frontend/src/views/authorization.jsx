import axios from "axios";
import { useDispatch } from "react-redux";
import UserCard from "../cards/userCard";
import { useEffect } from "react";
import { useState } from "react";

const Authorization = () => {
  const [users, setUsers] = useState([])
  const dispatch = useDispatch();
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

  }, [])
  
  
  return (
    <>
        <div>
            <h1>Authorization Page</h1>
              {users.length > 0 ? (
                  <div className="User-list">
                      {users.map((user) => (
                          <UserCard key={user._id} userId={user._id} email={user.email} permissions={user.permissions} isAdmin={user.isAdmin} userName={user.userName}/>
                      ))}
                  </div>
              ) : (
                  <p>No users found</p>
              )}
        </div>
    </>
  );
}
export default Authorization;