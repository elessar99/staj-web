import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import "./inventoryCard.css"; 
import Swal from 'sweetalert2';

const InventoryCard = ({name ="name", link ="link", productSerialNumber ="SerialNumber", _id, device ="device", location ="location", status ="status"}) => {
    const [statusState, setStatusState] = useState(status)
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Envanter Silme Onayı',
            html: `
                <div style="text-align: left; line-height: 1.6; font-size: 14px;">
                <div style="margin-bottom: 15px;">
                    <b>${name}</b> isimli envanter kaydını silmek üzeresiniz.
                </div>
                
                <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;">
                    <div style="margin-bottom: 5px;"><b>Envanter Detayları:</b></div>
                    <div>• <b>IP Adresi:</b> ${link}</div>
                    <div>• <b>Seri Numarası:</b> ${productSerialNumber}</div>
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
            await axios.delete(`http://localhost:5000/api/inventories/${_id}`,{
                withCredentials: true,
                credentials: 'include'
            });
            Swal.fire('Silindi!', 'Kayıt başarıyla silindi.', 'success');
            window.location.reload()
            } catch (error) {
            Swal.fire('Hata!', 'Silme işlemi başarısız oldu.', 'error');
            }
        }
    }

  const handleStatusChange = async (newStatus) => {
    const result = await Swal.fire({
      title: 'Statü Değiştirme Onayı',
      html: `
        <div style="text-align: left; line-height: 1.6; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <b>${name}</b> isimli cihazın durumu <b>${statusState}</b> → <b>${newStatus}</b> olarak değiştirilecek.
          </div>
          
          <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;">
            <div style="margin-bottom: 5px;"><b>Cihaz Detayları:</b></div>
            <div>• <b>Cihaz:</b> ${device}</div>
            <div>• <b>IP Adresi:</b> ${link}</div>
            <div>• <b>Konum:</b> ${location}</div>
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
        // StatusState'i hemen güncelle (optimistic update)
        setStatusState(newStatus);
        
        // Backend'e istek gönder
        const response = await axios.patch(
          `http://localhost:5000/api/inventories/${_id}`, // Backend route'unuza uygun endpoint
          { status: newStatus },
          {
            withCredentials: true,
            credentials: 'include'
          }
        );
        
        console.log(response);
        Swal.fire('Başarılı!', 'Durum başarıyla güncellendi.', 'success');
        
      } catch (error) {
        // Hata durumunda state'i eski haline getir
        setStatusState(status);
        console.log(error);
        
        Swal.fire(
          'Hata!', 
          'Durum güncellenirken bir hata oluştu: ' + 
          (error.response?.data?.message || error.message), 
          'error'
        );
      }
    } else {
      // İptal edildiyse select'i eski değere geri al
      setStatusState(statusState);
    }
  }


    return (
        <div className="inventoryCardContainer">
            <div className="inventoryCard">
                <div className="inventoryCardInfo flex1">{device}</div>
                <div className="inventoryCardInfo flex3">{name}</div>
                <div className="inventoryCardInfo flex2">{link}</div>
                <div className="inventoryCardInfo flex2">{productSerialNumber}</div>
                <div className="inventoryCardInfo flex1">{location}</div>
                <select className="inventoryCardSelect flex2" value={statusState} onChange={
                    (e)=>{handleStatusChange(e.target.value)}}>
                    <option className="inventoryCardOptions optionActive" value="active">active</option>
                    <option className="inventoryCardOptions optionInactive" value="inactive">inactive</option>
                    <option className="inventoryCardOptions optionMaintenance" value="maintenance">maintenance</option>
                </select>
                <div className="inventoryCardInfo flex1">
                    <div className="deletItemBtn flex1" onClick={handleDelete}>Delete Item</div>
                </div>
            </div>
        </div>
    );
};
InventoryCard.PropTypes = {
    device: PropTypes.string,
    name: PropTypes.string,
    link: PropTypes.string,
    productSerialNumber: PropTypes.string,
    location: PropTypes.string,
    _id: PropTypes.string.isRequired,
};
InventoryCard.defaultProps = {
    device: "Unknown Device",
    name: "Unnamed Project",
    link: "No Link",
    productSerialNumber: "No PSN",
    location: "No Location",
    _id: "",
};
export default InventoryCard;