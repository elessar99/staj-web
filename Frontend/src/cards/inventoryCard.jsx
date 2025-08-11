import { useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import "./inventoryCard.css"; 
import Swal from 'sweetalert2';

const InventoryCard = ({name, link, productSerialNumber, _id}) => {
    const deleteInventory = async () => {
        try {   
            if (!_id) {
                alert("Please enter a valid inventory ID to delete.");
                return;
            }
            const response = await axios.delete(`http://localhost:5000/api/inventories/${_id}`);
            console.log("Inventory deleted:", response.data);
            window.location.reload(); // Sayfayı yenile
            // Envanter listesini güncelle
            dispatch({ type: "DELETE_INVENTORY", payload: _id });
        } catch (error) {
            console.error("Error deleting inventory:", error);
            alert("Error deleting inventory: " + error.message);
        }
    }
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
            await axios.delete(`http://localhost:5000/api/inventories/${_id}`);
            Swal.fire('Silindi!', 'Kayıt başarıyla silindi.', 'success');
            window.location.reload()
            } catch (error) {
            Swal.fire('Hata!', 'Silme işlemi başarısız oldu.', 'error');
            }
        }
    }
    const dispatch = useDispatch();
    return (
        <div className="inventoryCardContainer">
            <div className="inventoryCard">
                <div className="inventoryName">Name: {name}</div>
                <div className="inventoryLink">Link: {link}</div>
                <div className="inventoryPSN">PSN: {productSerialNumber}</div>
                <div className="deletItemBtn" onClick={handleDelete}>Delete Item</div>
            </div>
        </div>
    );
};
InventoryCard.PropTypes = {
    name: PropTypes.string,
    link: PropTypes.string,
    productSerialNumber: PropTypes.string,
    _id: PropTypes.string.isRequired,
};
InventoryCard.defaultProps = {
    name: "Unnamed Project",
    link: "No Link",
    productSerialNumber: "No PSN",
    _id: "",
};
export default InventoryCard;