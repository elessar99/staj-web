import axios from "axios";
import { useDispatch } from "react-redux";

const Home = () => {
  const dispatch = useDispatch();
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
  
  return (
    <>
        <div>
            <h1>Welcome to the Home Page</h1>
            <div>
              <button onClick={fetchLogout}>logout</button>
            </div>
        </div>
    </>
  );
}
export default Home;