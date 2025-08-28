import axios from "axios";
import { useDispatch } from "react-redux";
import UserCard from "../cards/userCard";
import { useEffect } from "react";
import { useState } from "react";
import NotUserCard from "../cards/notUserCard";
import "./authorization.css"
import SearchBar from "../components/SearchBar";

const Authorization = () => {
  const [search, setSearch] = useState("")
  const [clearUserList, setClearUserList] = useState([])
  const [userVerificationBtn, setUserVerificationBtn] = useState(false)
  const [userListBtn, setUserListBtn] = useState(false)
  const [users, setUsers] = useState([])
  const [noneVerifiedUsers, setNoneVerifiedUsers] = useState([])

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState(null)
  const [department, setDepartment] = useState(null)
  const [sicilNo, setSicilNo] = useState(null)
  const [position, setPosition] = useState(null)

  const dispatch = useDispatch();

  const fetchingData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user', {
        withCredentials: true,
        credentials: 'include'
      });
      setUser(response.data.user);
      setMessages(response.data.messages || []);
      setPhone(response.data.user.phone || "")
      setDepartment(response.data.user.department || "")
      setSicilNo(response.data.user.sicilNo || "")
      setPosition(response.data.user.position || "")
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    fetchingData();
  }, []);

  const handleMsgClick = (msg) => setSelectedMsg(msg);
  const handleClosePopup = () => setSelectedMsg(null);

  const handleDeleteMsg = async (msgId) => {
    // Silme işlemi örnek
    setMessages(messages.filter(m => m._id !== msgId));
    setSelectedMsg(null);
  };

  const toggleUserVerification = () => {
    setUserVerificationBtn(!userVerificationBtn);
  };
  const toggleUserList = () => {
    setUserListBtn(!userListBtn);
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

  useEffect(() => {
    if (search) {
        const searchLower = search.toLocaleLowerCase('tr');
        
        const filtered = users.filter(item => {
        // Tüm string özelliklerde arama yap
        return Object.values(item).some(value => {
            if (typeof value === 'string') {
            return value.toLocaleLowerCase('tr').includes(searchLower);
            }
            return false;
        });
        });

        setClearUserList(filtered);
    } else {
        setClearUserList(users);
    }
}, [search, users]);
  
if (!user) return <div>Yükleniyor...</div>;
  
  return (
    <>
        <div className="userPageContainer">
      <div className="userPageTitle">
        {user.userName} Admin Page
      </div>
        <div className="userPageInfo">
          <div className="userInfoLine">
            <div className="userInfoLineTitle"> <strong>Email:</strong> </div>
            <div className="userInfoLineItem">{user.email}</div>
          </div>
          <div className="userInfoLine">
            <div className="userInfoLineTitle"> <strong>Phone:</strong> </div>
            <div className="userInfoLineItem">{editMode? <input className="editInfoInput" 
            value={phone} onChange={(e)=>{setPhone(e.target.value)}}/> 
            :(user.phone || "Belirtilmemiş")}</div>
          </div>
          <div className="userInfoLine">
            <div className="userInfoLineTitle"> <strong>Department:</strong> </div>
            <div className="userInfoLineItem">{editMode? <input className="editInfoInput" 
            value={department} onChange={(e)=>{setDepartment(e.target.value)}}/> 
            :(user.department || "Belirtilmemiş")}</div>
          </div>
          <div className="userInfoLine">
            <div className="userInfoLineTitle"> <strong>Position:</strong> </div>
            <div className="userInfoLineItem">{editMode? <input className="editInfoInput" 
            value={position} onChange={(e)=>{setPosition(e.target.value)}}/> 
            :(user.position || "Belirtilmemiş")}</div>
          </div>
          <div className="userInfoLine">
            <div className="userInfoLineTitle"> <strong>Sicil No:</strong> </div>
            <div className="userInfoLineItem">{editMode? <input className="editInfoInput" 
            value={sicilNo} onChange={(e)=>{setSicilNo(e.target.value)}}/> 
            :(user.sicilNo || "Belirtilmemiş")}</div>
          </div>
        </div>
        <div className="editUserInfoSection">
          <div className="userInfoLineBtn" >edit</div>
        </div>
    </div>


        <div className="userVerificationBtn" onClick={toggleUserVerification}>User Verification</div>
          {userVerificationBtn && (<div>
                <div className="userListHeadrer">
                  <div className="userListHeadrerItem">Name</div>
                  <div className="userListHeadrerItem">email</div>
                  <div className="userListHeadrerItem">department</div>
                  <div className="userListHeadrerItem">position</div>
                  <div className="userListHeadrerItem">Sicil No</div>
                </div>
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
        <div className="userListBtn" onClick={toggleUserList}>User List</div>
        {userListBtn && (
          <div style={{marginTop:"20px"}}>
              <SearchBar value={search} onChange={(e) => setSearch(e.target.value)}/>
                <div className="userListHeadrer">
                  <div className="userListHeadrerItem">Name</div>
                  <div className="userListHeadrerItem">email</div>
                  <div className="userListHeadrerItem">department</div>
                  <div className="userListHeadrerItem">position</div>
                  <div className="userListHeadrerItem">Sicil No</div>
                </div>
              {clearUserList.length > 0 ? (
                  <div className="User-list">
                      {clearUserList.map((user) => (
                          <UserCard key={user._id} userId={user._id} email={user.email} permissions={user.permissions} isAdmin={user.isAdmin} userName={user.userName}/>
                      ))}
                  </div>
              ) : (
                  <p style={{color:"black"}}>No users found</p>
              )}
        </div>)}
    </>
  );
}
export default Authorization;