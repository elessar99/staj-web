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

const UserCard = ({userId, userName="name", email="mail", isAdmin=false, permissions=[{project:"id",sites:[]}]}) => {
    const [authority, setAuthority] = useState(isAdmin);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showAddSitesModal, setShowAddSitesModal] = useState(false);
    const [showRemoveSitesModal, setShowRemoveSitesModal] = useState(false);
    
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
                <div style={{flex:1}}>
                    {userName}
                </div>
                <div style={{flex:1}}>
                    <select 
                        value={authority} 
                        onChange={(e) => handleAuthorityChange(e.target.value)}
                    >
                        <option value={true}>Admin</option>
                        <option value={false}>User</option>
                    </select>
                </div>
                <div className="userCardBtn" style={{flex:1}} onClick={() => setShowAddModal(true)}>
                    Add To Project 
                </div>
                <div className="userCardBtn" style={{flex:1}} onClick={() => setShowAddSitesModal(true)}>
                    Add To Site
                </div>
                <div className="userCardBtn" style={{flex:1}} onClick={() => setShowRemoveModal(true)}>
                    Remove From Project
                </div>
                <div className="userCardBtn" style={{flex:1}} onClick={() => setShowRemoveSitesModal(true)}>
                    Remove From Site
                </div>
                <div className="userCardBtn" style={{flex:1}} onClick={handleDeleteUser}>
                    Delete User
                </div>
            </div>
            <div></div>
        </div>
          {showAddModal && (
            <AddToProject
              userId={userId}
              onClose={(success) => {
                setShowAddModal(false);
                if (success) {
                  // Başarılı olursa yapılacak işlemler
                }
              }}
            />
          )}

          {showRemoveModal && (
            <RemoveFromProject
              userId={userId}
              onClose={(success) => {
                setShowRemoveModal(false);
                if (success) {
                  // Başarılı olursa yapılacak işlemler
                }
              }}
            />
          )}
          {showAddSitesModal && (
            <AddSitesToUser 
              userId={userId}
              onClose={(success) => {
                setShowAddSitesModal(false);
                if (success) {
                  // Başarılı olursa yapılacak işlemler
                }
              }}
            />
          )}

          {showRemoveSitesModal && (
            <RemoveSitesFromUser 
              userId={userId}
              onClose={(success) => {
                setShowRemoveSitesModal(false);
                if (success) {
                  // Başarılı olursa yapılacak işlemler
                }
              }}
            />
          )}
      </>
    );
};

UserCard.propTypes = {
    userId: PropTypes.string.isRequired,
    userName: PropTypes.string,
    email: PropTypes.string,
    isAdmin: PropTypes.bool,
    permissions: PropTypes.arrayOf(PropTypes.shape({
        project: PropTypes.string,
        sites: PropTypes.arrayOf(PropTypes.string)
    }))
};

UserCard.defaultProps = {
    userName: "İsimsiz Kullanıcı",
    email: "email@example.com",
    isAdmin: false,
    permissions: []
};

export default UserCard;