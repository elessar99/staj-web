import axios from "axios";
import { useEffect, useState } from "react";
import "../vCss/userPage.css";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState(null)
  const [department, setDepartment] = useState(null)
  const [sicilNo, setSicilNo] = useState(null)
  const [position, setPosition] = useState(null)
  

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

  const editUserInfo = async () => {
    try {
      const response = await axios.patch('http://localhost:5000/api/user', {
        "department" : department, 
        "phone" : phone, 
        "sicilNo" : sicilNo,
        "position" : position
      }, { 
        withCredentials: true,
        credentials: 'include'
       });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error updating user info:", error);
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

  if (!user) return <div>Yükleniyor...</div>;

  return (
    <div className="userPageContainer">
      <div className="userPageTitle">
        {user.userName} Kullanıcı Sayfası
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
        <div>
          <div className="userMessage">Messages</div>
          {messages.length === 0 ? (
            <p>Henüz mesajınız yok.</p>
          ) : (
            <ul>
              {messages.map(msg => (
                <li key={msg._id} onClick={() => handleMsgClick(msg)} style={{cursor: 'pointer'}}>
                  {msg.title} - {new Date(msg.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
          {selectedMsg && (
            <div className="popup">
              <div className="popupContent">
                <h4>{selectedMsg.title}</h4>
                <p>{selectedMsg.content}</p>
                <button onClick={() => handleDeleteMsg(selectedMsg._id)}>Mesajı Sil</button>
                <button onClick={handleClosePopup}>Kapat</button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="userMessage">Activity Logs</div>
          <p>Activity logs will be displayed here.</p>
        </div>
    </div>
  );
};
export default UserPage;