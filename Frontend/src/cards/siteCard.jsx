import { useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import "./siteCard.css"; 
import Swal from 'sweetalert2';

const SiteCard = ({name, _id, projectId, projectName, inventoryCount}) => {
    const dispatch = useDispatch();
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Site Silme Onayı',
            html: `
                <div style="text-align: left; line-height: 1.6; font-size: 14px;">
                <div style="margin-bottom: 15px;">
                    <b>${name}</b> adlı siteyi ve bağlı tüm envanterleri silmek üzeresiniz.
                </div>
                
                <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    <div style="margin-bottom: 5px;"><b>Site Detayları:</b></div>
                    <div>• <b>Proje Adı:</b> ${projectName}</div>
                    <div>• <b>Envanter Sayısı:</b> ${inventoryCount}</div>
                </div>
                
                <div style="color: #d32f2f; font-weight: bold; font-size: 13px; border-top: 1px solid #eee; padding-top: 10px;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 5px;"></i>
                    Bu işlem geri alınamaz ve tüm bağlı envanterler kalıcı olarak silinecektir!
                </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            cancelButtonColor: '#7a7a7a',
            confirmButtonText: '<i class="fas fa-trash" style="margin-right: 5px;"></i> Sil',
            cancelButtonText: '<i class="fas fa-times" style="margin-right: 5px;"></i> Vazgeç',
            focusCancel: true,
            showCloseButton: true,
            customClass: {
                popup: 'custom-swal-popup',
                actions: 'custom-swal-actions'
            }
        });
        if (result.isConfirmed) {
            try {
            await axios.delete(`http://localhost:5000/api/sites/${_id}`,{
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
    return (
        <div className="siteCardContainer">
            <div className="siteCard">
                <div className="siteName">{name}</div>
                {projectName !== "afnslofbnasfnawş" ? (<div className="siteId">Project: {projectName}</div>) : null}
                <div className="siteId">Inventory Count : {inventoryCount}</div>
                <div className="siteId">ID: {_id}</div>
                <div className="siteCardBtn" onClick={() => {
                    dispatch({ type: "SET_SITE", payload: { name, projectId, _id} });
                    console.log("projectId:", projectId);
                    window.location.href = `/${_id}/inventory`;
                }}> Select Site</div>
                <div className="siteCardBtn" onClick={handleDelete}> Delet Site</div>
            </div>
        </div>
    );
};
SiteCard.PropTypes = {
    name: PropTypes.string,
    _id: PropTypes.string,
    projectId: PropTypes.string,
    projectName: PropTypes.string,
    inventoryCount: PropTypes.string,
};
SiteCard.defaultProps = {
    name: "Unnamed Project",
    _id: "No ID",
    projectId: "No Project ID",
    projectName: "",
    inventoryCount: "0",
};
export default SiteCard;