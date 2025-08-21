import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Navbar.css"; 
import axios from "axios";

const AdminBar = () => {
  const [active, setActive] = useState("home");
  const project = useSelector((state) => state.project || []);
  const site = useSelector((state) => state.site || []);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user || []);

  const fetchLogout = async ()=>{
    try{
      const response = await axios.post(
        'http://localhost:5000/api/auth/logout',{},
        {
          withCredentials: true
        }      
      );
      console.log(response)
      dispatch({ type: "RESET_USER"});
      window.location.reload(); 
    } catch (error){
      console.log("Error fatchLogin: ", error.response.data.error);
    }
  }
  
  useSelector((state) => state.project);
  return (
    <div className="navbar">
      <div className="navbar-links">
        <div className="linkBtn"><a href="/admin/authorization">authorization</a></div>
      </div>
        <div className="userInfo">{user.userName}</div>

    </div>
  );
}
export default AdminBar;