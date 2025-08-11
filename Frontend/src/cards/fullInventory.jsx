import { useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import "./inventoryCard.css"; 
import Swal from 'sweetalert2';

const FullInventory = ({name, link, productSerialNumber, _id, sites, project}) => {
    const deleteInventory = async () => {
        const result = await Swal.fire({
            title: 'Envanter Silme Onayı',
            html: `
                <div style="text-align: left; line-height: 1.6;">
                <div><b>Proje:</b> ${project}</div>
                <div><b>Site:</b> ${sites}</div>
                <hr style="margin: 10px 0;">
                <div><b>Envanter Adı:</b> ${name}</div>
                <div><b>IP Adresi:</b> ${link}</div>
                <div><b>Seri Numarası:</b> ${productSerialNumber}</div>
                </div>
                <div style="margin-top: 15px; color: #ff4444; font-weight: bold;">
                Bu kaydı silmek istediğinize emin misiniz?
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sil',
            cancelButtonText: 'Vazgeç',
            focusCancel: true,
            customClass: {
                htmlContainer: 'text-left'
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
                <div className="siteProjectName">Sites: {sites}</div>
                <div className="siteProjectName">Project: {project}</div>
                <div className="deletItemBtn" onClick={deleteInventory}>Delete Item</div>
            </div>
        </div>
    );
};
FullInventory.PropTypes = {
    name: PropTypes.string,
    link: PropTypes.string,
    productSerialNumber: PropTypes.string,
    _id: PropTypes.string.isRequired,
    sites: PropTypes.string,
    project: PropTypes.string,
};
FullInventory.defaultProps = {
    name: "Unnamed Project",
    link: "No Link",
    productSerialNumber: "No PSN",
    _id: "",
    sites: "",
    project: "",
};
export default FullInventory;