import React, { useState } from "react";
import './userLogs.css';

const UserLogs = ({ logs, onClose }) => {
  const [selectedAction, setSelectedAction] = useState("ALL");
  
  const actionTypes = [
    "ALL",
    "VERIFY_USER", 
    "CHANGE_AUTHORITY",
    "DELETE_USER",
    "USER_INCLUDE",
    "USER_EXCLUDE",
    "ADD_INVENTORY",
    "DELETE_INVENTORY",
    "CHANGE_INVENTORY_STATUS",
    "ADD_PROJECT",
    "DELETE_PROJECT",
    "ADD_SITE",
    "DELETE_SITE",
    "UPLOAD_EXCEL"
  ];

  const filteredLogs = selectedAction === "ALL" 
    ? logs 
    : logs.filter(log => log.action === selectedAction);

  const getActionDisplayName = (action) => {
    const actionMap = {
      "VERIFY_USER": "Kullanıcı Doğrulama",
      "CHANGE_AUTHORITY": "Yetki Değişikliği",
      "DELETE_USER": "Kullanıcı Silme",
      "USER_INCLUDE": "Kullanıcı Ekleme",
      "USER_EXCLUDE": "Kullanıcı Çıkarma",
      "ADD_INVENTORY": "Envanter Ekleme",
      "DELETE_INVENTORY": "Envanter Silme",
      "CHANGE_INVENTORY_STATUS": "Envanter Durum Değişikliği",
      "ADD_PROJECT": "Proje Ekleme",
      "DELETE_PROJECT": "Proje Silme",
      "ADD_SITE": "Site Ekleme",
      "DELETE_SITE": "Site Silme",
      "UPLOAD_EXCEL": "Excel Yükleme"
    };
    return actionMap[action] || action;
  };

  const getActionColor = (action) => {
    const colorMap = {
      "VERIFY_USER": "#4caf50",
      "CHANGE_AUTHORITY": "#2196f3",
      "DELETE_USER": "#f44336",
      "USER_INCLUDE": "#ff9800",
      "USER_EXCLUDE": "#ff5722",
      "ADD_INVENTORY": "#009688",
      "DELETE_INVENTORY": "#795548",
      "CHANGE_INVENTORY_STATUS": "#673ab7",
      "ADD_PROJECT": "#3f51b5",
      "DELETE_PROJECT": "#607d8b",
      "ADD_SITE": "#00bcd4",
      "DELETE_SITE": "#9c27b0",
      "UPLOAD_EXCEL": "#ffeb3b"
    };
    return colorMap[action] || "#666666";
  };

  return (
    <div className="userLogsOverlay" onClick={onClose}>
      <div className="userLogsPopup" onClick={(e) => e.stopPropagation()}>   
        <div className="userLogsHeader">
          <h2>Kullanıcı Log Kayıtları</h2>
          <button className="userLogsCloseBtn" onClick={onClose}>×</button>
        </div>
        
        <div className="userLogsFilters">
          <label>Filtrele:</label>
          <select 
            value={selectedAction} 
            onChange={(e) => setSelectedAction(e.target.value)}
            className="actionFilter"
          >
            {actionTypes.map(action => (
              <option key={action} value={action}>
                {action === "ALL" ? "Tümü" : getActionDisplayName(action)}
              </option>
            ))}
          </select>
          <span className="logCount">
            {filteredLogs.length} log gösteriliyor
          </span>
        </div>

        <div className="logsContainer">
          {filteredLogs && filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log._id} className="logEntry">
                <div className="logHeader">
                  <span 
                    className="actionBadge"
                    style={{ backgroundColor: getActionColor(log.action) }}
                  >
                    {getActionDisplayName(log.action)}
                  </span>
                  <span className="logDate">
                    {new Date(log.timestamp).toLocaleString("tr-TR", { 
                      timeZone: "Europe/Istanbul",
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="logDetails">
                  <p><strong>Detaylar:</strong> {log.details}</p>
                </div>
                {log.ipAddress && (
                  <div className="logMeta">
                    <span>IP: {log.ipAddress}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="noLogs">
              <p>Bu kullanıcı için log kaydı bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserLogs;