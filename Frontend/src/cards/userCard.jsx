import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import "./userCard.css"; 
import Swal from 'sweetalert2';
import RemoveFromProject from "../components/popup/RemoveFromProject";
import AddToProject from "../components/popup/AddToProject";
import RemoveSitesFromUser from "../components/popup/removeSitesFromUser";
import AddSitesToUser from "../components/popup/addSitesToUser";
import UserLogs from "../components/popup/userLogs";

const UserCard = ({userId, userName="name", department="department", position="position", sicilNo="00000",  email="mail", isAdmin=false, permissions=[{project:"id",sites:[]}]}) => {
    const [authority, setAuthority] = useState(isAdmin);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showAddSitesModal, setShowAddSitesModal] = useState(false);
    const [showRemoveSitesModal, setShowRemoveSitesModal] = useState(false);
    const [showLogsPopup, setShowLogsPopup] = useState(false);
    const [userLogs, setUserLogs] = useState([]);
    const [scheduleUserDeletion, setscheduleUserDeletion] = useState(false)

    const fetchUserLogs = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/logs/user/${userId}`, {
        withCredentials: true,
        credentials: 'include'
      });
      setUserLogs(response.data || []);
      setShowLogsPopup(true);
      console.log("logs:",response.data);
    } catch (error) {
      console.error("Error fetching user logs:", error);
    }
  };

  const handleScheduleUserDeletion = async () => {
    const { value: days } = await Swal.fire({
      title: 'Kullanıcı Silme Planı',
      input: 'number',
      inputLabel: 'Kaç gün sonra silinsin?',
      inputPlaceholder: 'Gün sayısı girin',
      inputAttributes: {
        min: 1,
        step: 1
      },
      showCancelButton: true,
      confirmButtonText: 'Planla',
      cancelButtonText: 'İptal',
      icon: 'question'
    });

    if (days) {
      try {
        await axios.patch(
          `http://localhost:5000/api/admin/scheduleDeletion/`,
          { userId: userId,
            days: Number(days) },
          { withCredentials: true, credentials: 'include' }
        );
        Swal.fire('Başarılı!', `${days} gün sonra kullanıcı otomatik silinecek.`, 'success');
      } catch (error) {
        Swal.fire('Hata!', 'Silme planı oluşturulamadı.', 'error');
        console.log(error);
      }
    }
  };
    
    const handleAuthorityChange = async (newAuthority) => {
        // Boolean değere çevir (select'ten string geliyor)
        const newAuthorityBool = newAuthority === 'true';
        
        const result = await Swal.fire({
            title: 'Yetki Değiştirme Onayı',
            html: `
            <div style="text-align: left; line-height: 1.6; font-size: 14px;">
                <div style="margin-bottom: 15px;">
                    <b>${userName}</b> kullanıcısının yetkisi <b>${authority ? 'Admin' : 'User'}</b> → 
                    <b>${newAuthorityBool ? 'Admin' : 'User'}</b> olarak değiştirilecek.
                </div>
                
                <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;">
                    <div style="margin-bottom: 5px;"><b>Kullanıcı Detayları:</b></div>
                    <div>• <b>Email:</b> ${email}</div>
                    <div>• <b>Kullanıcı ID:</b> ${userId}</div>
                </div>
            </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1976d2',
            cancelButtonColor: '#757575',
            confirmButtonText: '<i class="fas fa-check"></i> Evet, Değiştir',
            cancelButtonText: '<i class="fas fa-times"></i> İptal',
            focusCancel: true,
            showCloseButton: true,
            customClass: {
                confirmButton: 'swal-confirm-button',
                cancelButton: 'swal-cancel-button'
            }
        });
        
        if (result.isConfirmed) {
            try {
                // State'i hemen güncelle (optimistic update)
                setAuthority(newAuthorityBool);
                
                // Backend'e istek gönder - users endpoint'ine
                const response = await axios.post(
                    `http://localhost:5000/api/admin/changeAuthority/${userId}`, // Kullanıcı yetki endpoint'i
                    { isAdmin: newAuthorityBool }, // Gönderilecek veri
                    {
                        withCredentials: true,
                        credentials: 'include'
                    }
                );
                
                console.log(response);
                Swal.fire('Başarılı!', 'Kullanıcı yetkisi başarıyla güncellendi.', 'success');
                window.location.reload()
            } catch (error) {
                // Hata durumunda state'i eski haline getir
                setAuthority(isAdmin);
                console.log(error);
                
                Swal.fire(
                    'Hata!', 
                    'Yetki güncellenirken bir hata oluştu: ' + 
                    (error.response?.data?.message || error.message), 
                    'error'
                );
            }
        } else {
            // İptal edildiyse select'i eski değere geri al
            setAuthority(isAdmin);
        }
    }

const handleDeleteUser = async () => {
  const result = await Swal.fire({
    title: 'Kullanıcı Silme Onayı',
    html: `
      <div style="text-align: left; line-height: 1.6; font-size: 14px;">
        <div style="margin-bottom: 15px;">
          <b>${userName}</b> isimli kullanıcıyı silmek üzeresiniz.
        </div>
        
        <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;">
          <div style="margin-bottom: 5px;"><b>Kullanıcı Detayları:</b></div>
          <div>• <b>Email:</b> ${email}</div>
          <div>• <b>Kullanıcı ID:</b> ${userId}</div>
          <div>• <b>Yetki:</b> ${isAdmin ? 'Admin' : 'Kullanıcı'}</div>
        </div>
        
        <div style="margin-top: 20px; color: #d32f2f; font-weight: bold; font-size: 13px;">
          <i class="fas fa-exclamation-triangle"></i> Bu işlem geri alınamaz!
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d32f2f',
    cancelButtonColor: '#757575',
    confirmButtonText: '<i class="fas fa-trash"></i> Evet, Sil',
    cancelButtonText: '<i class="fas fa-times"></i> İptal',
    focusCancel: true,
    showCloseButton: true,
    customClass: {
      confirmButton: 'swal-confirm-button',
      cancelButton: 'swal-cancel-button'
    }
  });

  if (result.isConfirmed) {
    try {
      // Yükleme göstergesi başlat
      Swal.fire({
        title: 'Siliniyor...',
        html: 'Kullanıcı siliniyor, lütfen bekleyin.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await axios.delete(
        `http://localhost:5000/api/admin/${userId}`,
        {
          withCredentials: true,
          credentials: 'include'
        }
      );
      
      console.log(response);
      
      // Başarılı mesajı
      Swal.fire(
        'Silindi!', 
        'Kullanıcı başarıyla silindi.', 
        'success'
      );
      
      // Sayfayı yenile veya kullanıcı listesini güncelle
      window.location.reload();
      
    } catch (error) {
      console.log(error.response);
      
      // Hata mesajı
      let errorMessage = 'Kullanıcı silinirken bir hata oluştu.';
      
      if (error.response?.status === 403) {
        errorMessage = 'Bu işlem için yetkiniz yok.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Kullanıcı bulunamadı.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire('Hata!', errorMessage, 'error');
    }
  }
};

    return (
        <>
          <div className="userCard">
            <div className="userCardContanier">
              <div className="userCardInfo">{userName}</div>
              <div className="userCardInfo">{email}</div>
              <div className="userCardInfo">{department}</div>
              <div className="userCardInfo">{position}</div>
              <div className="userCardInfo">{sicilNo}</div>
              {/* 3 nokta butonu */}
              <div className="userCardMoreBtn" onClick={() => setShowModal(true)}>
                <span style={{ fontSize: "2rem", cursor: "pointer" }}>⋮</span>
              </div>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="userCardModalOverlay" onClick={() => setShowModal(false)}>
              <div className="userCardModal" onClick={e => e.stopPropagation()}>
                <h4>{userName} İşlemleri</h4>
                <button className="userCardModalBtn" onClick={() => { setShowAddModal(true); setShowModal(false); }}>Add Project</button>
                <button className="userCardModalBtn" onClick={() => { setShowAddSitesModal(true); setShowModal(false); }}>Add Site</button>
                <button className="userCardModalBtn" onClick={() => { setShowRemoveModal(true); setShowModal(false); }}>Remove Project</button>
                <button className="userCardModalBtn" onClick={() => { setShowRemoveSitesModal(true); setShowModal(false); }}>Remove Site</button>
                <button className="userCardModalBtn" onClick={handleDeleteUser}>Delete User</button>
                <div style={{ margin: "12px 0" }}>
                  <label style={{ fontWeight: 500 }}>Yetki:</label>
                  <select
                    className="userCardSelect"
                    value={authority}
                    onChange={(e) => handleAuthorityChange(e.target.value)}
                    style={{ marginLeft: 8 }}
                  >
                    <option value={true}>Admin</option>
                    <option value={false}>User</option>
                  </select>
                </div>
                <button className="userCardModalBtn" onClick={() => {fetchUserLogs(userId)}}>User Logs</button>
                <button className="userCardModalBtn" onClick={handleScheduleUserDeletion}>Schedule User Deletion</button>
                <button className="userCardModalClose" onClick={() => setShowModal(false)}>Kapat</button>
              </div>
            </div>
          )}
          {/* Diğer popup'lar */}
          {showLogsPopup && (
            <UserLogs logs={userLogs.logs} onClose={() => setShowLogsPopup(false)} />
          )}
          {showAddModal && (
            <AddToProject userId={userId} onClose={() => setShowAddModal(false)} />
          )}
          {showRemoveModal && (
            <RemoveFromProject userId={userId} onClose={() => setShowRemoveModal(false)} />
          )}
          {showAddSitesModal && (
            <AddSitesToUser userId={userId} onClose={() => setShowAddSitesModal(false)} />
          )}
          {showRemoveSitesModal && (
            <RemoveSitesFromUser userId={userId} onClose={() => setShowRemoveSitesModal(false)} />
          )}
        </>
    );
};


export default UserCard;