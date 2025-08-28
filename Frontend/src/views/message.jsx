import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../vCss/message.css";

const Message = () => {
  const [messageTitle, setMessageTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState({ receivedMessages: [], sentMessages: [] });
  const [sendMessage, setSendMessage] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const userId = useParams().userId;

  const fatchUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/${userId}`, {
        withCredentials: true,
        credentials: "include",
      });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getMessageswithUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
        withCredentials: true,
        credentials: "include",
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
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

  // Boş fonksiyon - içine sen backend isteğini yazabilirsin
  const markAsRead = async (messageId) => {
    try {
      // await axios.put(`http://localhost:5000/api/messages/${messageId}/read`, {}, {...})
      // setMessages(... güncelleme işlemi ...)
    } catch (error) {
      console.error("Mesaj okunamadı:", error);
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      markAsRead(msg._id);
    }
  };

  useEffect(() => {
    fatchUser();
    getMessageswithUser();
  }, []);

  return (
    <>
      <div className="messageContainer" style={{color: "black"}}>
        <form className="sendMessageForm">
          <div className="sendMessageTitle">Send Message to {user?.userName}</div>
          <input
            type="text"
            placeholder="Message Title"
            className="messageTitleInput"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
          />
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
            onClick={handleSendMessage}
          >
            Send Message
          </button>
        </form>

        {/* Gelen Mesajlar */}
        <div
          className="MessagesBtn"
          onClick={() => {
            setReceivedMessage(!receivedMessage);
          }}
        >
          Messages from {user?.userName}
        </div>
        {receivedMessage && (
          <div className="receivedMessages">
            {messages.receivedMessages &&
              messages.receivedMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="messageItem"
                  onClick={() => handleSelectMessage(msg)}
                >
                  <div className="receivedMessagesTitle">{msg.title}</div>
                  <div className="receivedMessageContent">Mesajı görmek için tıklayın</div>
                  <div className="messageDate">
                    {new Date(msg.timestamp).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                  </div>
                  {msg.isRead ? (
                    <div className="readStatus read">Read</div>
                  ) : (
                    <div className="readStatus unread">Unread</div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Gönderilen Mesajlar */}
        <div
          className="MessagesBtn"
          onClick={() => {
            setSendMessage(!sendMessage);
          }}
        >
          Messages to {user?.userName}
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
                  {msg.isRead ? (
                    <div className="readStatus read">Read</div>
                  ) : (
                    <div className="readStatus unread">Unread</div>
                  )}
                </div>
              ))}
          </div>
        )}
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
              {selectedMessage.isRead ? "Okundu" : "Okunmadı"}
            </div>
            <button className="popupCloseBtn" onClick={() => setSelectedMessage(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
