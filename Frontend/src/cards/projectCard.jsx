import { useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import "./ProjectCard.css"; 
import Swal from 'sweetalert2';

const ProjectCard = ({name, id, inventoryCount, siteCount}) => {
    const dispatch = useDispatch();
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Proje Silme Onayı',
            html: `
                <div style="text-align: left; line-height: 1.6;">
                <div style="margin-bottom: 15px; font-size: 1.1em;">
                    <b>${name}</b> projesini silmek üzeresiniz.
                </div>
                
                <div style="background: #fff8f8; padding: 12px; border-radius: 6px; border-left: 4px solid #ff4444;">
                    <div><b>Silinecek İçerik:</b></div>
                    <div style="margin-top: 8px;">
                    <div>• <b>Site Sayısı:</b> ${siteCount}</div>
                    <div>• <b>Envanter Sayısı:</b> ${inventoryCount}</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; color: #d33; font-weight: bold;">
                    Bu işlem geri alınamaz ve tüm bağlı veriler kalıcı olarak silinecektir!
                </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#7a7a7a',
            confirmButtonText: 'Sil',
            cancelButtonText: 'Vazgeç',
            focusCancel: true,
            customClass: {
                container: 'swal2-container-custom',
                popup: 'swal2-popup-custom'
            }
        });
        if (result.isConfirmed) {
            try {
            await axios.delete(`http://localhost:5000/api/projects/${id}`, {
                withCredentials: true,
                credentials: 'include'
            });
            Swal.fire('Silindi!', 'Kayıt başarıyla silindi.', 'success');
            window.location.reload()
            } catch (error) {
                console.log(error)
            Swal.fire('Hata!', 'Silme işlemi başarısız oldu.', 'error');
            }
        }
    }
    return (
        <div className="projectCardContainer" >
            <div className="projectCard">
                <div className="projectName">{name}</div>
                <div className="projectId">Site Count: {siteCount}</div>
                <div className="projectId">Inventory Count: {inventoryCount}</div>
                <div className="projectId">ID: {id}</div>
                <div className="projectCardBtn" onClick={() => {
                    dispatch({ type: "SET_PROJECT", payload: { name, id } });
                    window.location.href = `/${id}/sites`;}}>Select Proje</div>
                <div className="projectCardBtn" onClick={() => {
                    handleDelete()
                    window.location.reload;}}>Delete Proje</div>
            </div>
        </div>
    );
};
ProjectCard.PropTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    inventoryCount: PropTypes.string,
    siteCount: PropTypes.string,
};
ProjectCard.defaultProps = {
    name: "Unnamed Project",
    id: "No ID",
    inventoryCount: "0",
    siteCount: "0",
};
export default ProjectCard;