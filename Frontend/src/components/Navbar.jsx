import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Navbar.css"; 
import axios from "axios";
import netasLogo from "../assets/netas-logo2x.png";

const Navbar = () => {
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
  console.log(user)
  return (
    <div className="navbar">
      <div className="navbar-links">
        <img src={netasLogo} alt="Netaş Logo" height={36} />
        {user.isAdmin? (
          <div className="linkBtn"><a href="/admin/authorization">authorization</a></div>
        ): <div/> }
        <div className="linkBtn"><a href="/">Projects</a></div>
        <div className="linkBtn"><a href={`/${project._id}/sites`}>Sites</a></div>
        <div className="linkBtn"><a href={`/${site._id}/inventory`}>Inventory</a></div>
        <div className="linkBtn"><a href="/filter/inventory">All Inventories</a></div>
        <div className="linkBtn"><a href="/filter/site">All Sites</a></div>
      </div>
        <div className="userInfo">{user.userName}</div>
        <button className="logoutBtn" onClick={fetchLogout}>logout</button>
    </div>
  );
}
export default Navbar;