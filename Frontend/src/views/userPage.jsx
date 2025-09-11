import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import "./authorization.css"
import "../vCss/userPage.css"

const UserPage = () => {
  const [receivedMessage, setReceivedMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState(null)
  const [department, setDepartment] = useState(null)
  const [sicilNo, setSicilNo] = useState(null)
  const [position, setPosition] = useState(null)


  const counterUnReadMessages = (messages) => {
    let count = 0;
    messages.forEach((msg) => {
      if (!msg.read) count++;
    });
    return count;
  }

  const markAsRead = async (messageId) => {
    try {
      await axios.patch(`http://localhost:5000/api/notification/${messageId}`, {}, {
        withCredentials: true,
        credentials: 'include'
      });
    } catch (error) {
      console.log("Mesaj okunamadı:", error);
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.read ) {
      markAsRead(msg._id);
    }
  };


  const handleDeleteMessage = async (messageId, isRead) => {
    try {
      if (!isRead) {
        alert("You can only delete read messages.");
        return;
      }
      await axios.delete(`http://localhost:5000/api/notification/${messageId}`, {
        withCredentials: true,
        credentials: 'include'
      });
      // Mesaj silindikten sonra mesajları yeniden getir
      fetchingMessages();
    } catch (error) {
      console.error("Mesaj silinirken hata:", error);
      alert("Mesaj silinirken hata oluştu.");
    }
  };

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

    const fetchingMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notification', {
        withCredentials: true,
        credentials: 'include'
      });
      setMessages(response.data || []);
      console.log("notification: ",response.data)
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };


  useEffect(() => {
    fetchingData();
    fetchingMessages();
  }, []);


  
if (!user) return <div>Yükleniyor...</div>;
  
  return (
    <>
    <div className="userPageContainer">
      <div className="userPageTitle">
        {user.userName} User Page
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
    </div>
        <div>
                    {/* Gelen Mesajlar */}
          <div
            className="MessagesBtn"
            onClick={() => {
              setReceivedMessage(!receivedMessage);
            }}
          >
            Notifications - {counterUnReadMessages(messages || [])} unread
          </div>
          {(messages.length > 0) && (receivedMessage) && (
            <div className="receivedMessages">
              {messages &&
                messages.map((msg) => (
                  <div className="receivedMessagesCard">
                  <div
                    key={msg._id}
                    className="messageItem receivedItem"
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div className="receivedMessagesTitle">{msg.type}</div>
                    <div className="receivedMessageContent">Mesajı görmek için tıklayın</div>
                    <div className="messageDate">
                      {new Date(msg.timestamp).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                    </div>
                    {msg.read ? (
                      <div className="readStatus read">Read</div>
                    ) : (
                      <div className="readStatus unread">Unread</div>
                    )}
                  </div>
                  <div className="messageDateBtn" onClick={()=> {handleDeleteMessage(msg._id, msg.read)}}>delete</div>
                  </div>
                ))}</div>
                )} 
          </div>

        {/* Popup (Modal) */}
      {selectedMessage && (
        <div className="messagePopupOverlay" onClick={() => setSelectedMessage(null)}>
          <div className="messagePopup" onClick={(e) => e.stopPropagation()}>
            <h3 className="popupTitle">{selectedMessage.type}</h3>
            {selectedMessage.isHtml ? <div
                  className="popupContent"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.content }}
                /> :(<p className="popupContent">{selectedMessage.content}</p>)}
            <div className="popupDate">
              {new Date(selectedMessage.timestamp).toLocaleString("tr-TR", {
                timeZone: "Europe/Istanbul",
              })}
            </div>
            <div className="popupStatus">
              {selectedMessage.read ? "Okundu" : "Okunmadı"}
            </div>
            <button className="popupCloseBtn" onClick={() => setSelectedMessage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
export default UserPage;