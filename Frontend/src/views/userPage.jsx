import axios from "axios";
import { useEffect, useState } from "react";
import "../vCss/userPage.css";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseMessage, setResponseMessage] = useState(null)
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState(null)
  const [department, setDepartment] = useState(null)
  const [sicilNo, setSicilNo] = useState(null)
  const [position, setPosition] = useState(null)
  const [sendMessage, setSendMessage] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageText, setMessageText] = useState("");

  const counterUnReadMessages = (messages) => {
    let count = 0;
    messages.forEach((msg) => {
      if (!msg.read) count++;
    });
    return count;
  }
  
  const markAsRead = async (messageId) => {
    try {
      await axios.patch(`http://localhost:5000/api/messages/read/${messageId}`, {}, {
        withCredentials: true,
        credentials: 'include'
      });
    } catch (error) {
      console.log("Mesaj okunamadı:", error);
    }
  };

  const handleSendMessage = async (userId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/messages",
        {
          toUserId: userId,
          content: messageText,
          title: messageTitle,
        },
        {
          withCredentials: true,
          credentials: "include",
        }
      );
      alert("Message sent successfully!");
      setMessageTitle("");
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  const handleDeleteMessage = async (messageId, isRead) => {
    try {
      if (!isRead) {
        alert("You can only delete read messages.");
        return;
      }
      await axios.delete(`http://localhost:5000/api/messages/${messageId}`, {
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

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.read ) {
      markAsRead(msg._id);
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

  const fetchingMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/messages', {
        withCredentials: true,
        credentials: 'include'
      });
      setMessages(response.data || []);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchingData();
    fetchingMessages();
  }, []);


  const handleDeleteMsg = async (msgId) => {
    // Silme işlemi örnek
    setMessages(messages.filter(m => m._id !== msgId));
    setSelectedMsg(null);
  };

  if (!user) return <div>Yükleniyor...</div>;

  return (
    <>
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
                    {/* Gelen Mesajlar */}
          <div
            className="MessagesBtn"
            onClick={() => {
              setReceivedMessage(!receivedMessage);
            }}
          >
            Received Messages - {counterUnReadMessages(messages.receivedMessages || [])}
          </div>
          {receivedMessage && (
            <div className="receivedMessages">
              {messages.receivedMessages &&
                messages.receivedMessages.map((msg) => (
                  <div className="receivedMessagesCard">
                  <div
                    key={msg._id}
                    className="messageItem receivedItem"
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div className="receivedMessagesTitle">{msg.title}</div>
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
              
                      {/* Gönderilen Mesajlar */}
          <div
            className="MessagesBtn"
            onClick={() => {
              setSendMessage(!sendMessage);
            }}
          >
            Sent Messages
          </div>
          {sendMessage && (
            <div className="sentMessages">
              {messages.sentMessages &&
                messages.sentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="messageItem"
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div className="sentMessagesTitle">{msg.title}</div>
                    <div className="sentMessageContent">Mesajı görmek için tıklayın</div>
                    <div className="messageDate">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
                        : "Tarih yok"}
                    </div>
                    {msg.read ? (
                      <div className="readStatus read">Read</div>
                    ) : (
                      <div className="readStatus unread">Unread</div>
                    )}
                  </div>
                ))}
            </div>
          )}   
          </div>
          <div>
            <div className="userMessage">Activity Logs</div>
            <p>Activity logs will be displayed here.</p>
          </div>
      </div>
      {/* Popup (Modal) */}
      {selectedMessage && (
        <div className="messagePopupOverlay" onClick={() => setSelectedMessage(null)}>
          <div className="messagePopup" onClick={(e) => e.stopPropagation()}>
            <h3 className="popupTitle">{selectedMessage.title}</h3>
            <p className="popupContent">{selectedMessage.content}</p>
            <div className="popupDate">
              {new Date(selectedMessage.timestamp).toLocaleString("tr-TR", {
                timeZone: "Europe/Istanbul",
              })}
            </div>
            <div className="popupStatus">
              {selectedMessage.read ? "Okundu" : "Okunmadı"}
            </div>
            {(user._id === selectedMessage.to)? (<button className="popupCloseBtn" onClick={() => {
              setResponseMessage(selectedMessage)
              setMessageTitle("Re: "+selectedMessage.title)
              setSelectedMessage(null)
            }}>
              Response Message
            </button>):<button className="popupCloseBtn" onClick={() => setSelectedMessage(null)}>
              Delete Message
            </button>}
            <button className="popupCloseBtn" onClick={() => setSelectedMessage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      {responseMessage && (
        <div className="messagePopupOverlay" onClick={() => {
          setResponseMessage(null)
          setMessageText("")
          setMessageTitle("")
          }}>
          <div className="sendMessageForm" style={{color:"black"}} onClick={(e) => e.stopPropagation()}>
            <div className="sendMessageTitle" style={{color:"black"}}>Send Response Message</div>
            <div className="messageTitleInput">{messageTitle}</div>
            <textarea
              placeholder="Type your message here..."
              className="messageTextArea"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={10}
              cols={50}
            />
            <button
              type="button"
              className="sendMessageBtn"
              onClick={()=>{handleSendMessage(responseMessage.from)}}
            >
              Send Message
              {responseMessage.from}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default UserPage;