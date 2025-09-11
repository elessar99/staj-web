import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "./InventoryCard.css";
import Swal from 'sweetalert2';

const FullInventory = ({
  sites,
  project,
  name = "name",
  link = "link",
  productSerialNumber = "SerialNumber",
  _id,
  device = "device",
  location = "location",
  status = "status",
  lisansStart = "",
  lisansEnd = "",
  followed= false,
}) => {
  const [statusState, setStatusState] = useState(status);
  const [showActions, setShowActions] = useState(false);

  // Statü değiştirme fonksiyonu
  const handleStatusChange = async (newStatus) => {
    const result = await Swal.fire({
      title: 'Statü Değiştirme Onayı',
      html: `
        <div style="text-align: left; line-height: 1.6; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <b>${name}</b> isimli cihazın durumu <b>${statusState}</b> → <b>${newStatus}</b> olarak değiştirilecek.
          </div>
          <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;">
            <div style="margin-bottom: 5px;"><b>Cihaz:</b> ${device}</div>
            <div><b>IP Adresi:</b> ${link}</div>
            <div><b>Konum:</b> ${location}</div>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Evet, Değiştir',
      cancelButtonText: 'İptal',
      focusCancel: true,
      showCloseButton: true
    });

    if (result.isConfirmed) {
      try {
        setStatusState(newStatus);
        await axios.patch(
          `http://localhost:5000/api/inventories/status/${_id}`,
          { status: newStatus },
          { withCredentials: true, credentials: 'include' }
        );
        Swal.fire('Başarılı!', 'Durum başarıyla güncellendi.', 'success');
        window.location.reload();
      } catch (error) {
        setStatusState(status);
        Swal.fire('Hata!', 'Durum güncellenirken bir hata oluştu.', 'error');
      }
    }
  };

  // Envanter güncelleme fonksiyonu
  const handleUpdate = async () => {
    setShowActions(false);
    Swal.fire({
      title: "Envanter Güncelle",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <b>${name}</b> isimli envanteri güncelleyeceksiniz.
          </div>
          <input id="swal-input-name" value="${name}" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" placeholder="İsim">
          <input id="swal-input-link" value="${link}" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" placeholder="Link">
          <input id="swal-input-serial" value="${productSerialNumber}" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" placeholder="Seri Numarası">
          <input id="swal-input-location" value="${location}" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" placeholder="Konum">
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Güncelle",
      cancelButtonText: "İptal",
      preConfirm: () => {
        return {
          name: document.getElementById("swal-input-name").value,
          link: document.getElementById("swal-input-link").value,
          productSerialNumber: document.getElementById("swal-input-serial").value,
          location: document.getElementById("swal-input-location").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(`http://localhost:5000/api/inventories/${_id}`, result.value, {
            withCredentials: true,
            credentials: "include",
          });
          Swal.fire("Başarılı!", "Envanter başarıyla güncellendi.", "success");
          window.location.reload();
        } catch (error) {
          Swal.fire("Hata!", "Güncelleme işlemi başarısız oldu.", "error");
        }
      }
    });
  };

  // Lisans güncelleme fonksiyonu
  const handleLisans = async () => {
    setShowActions(false);
    Swal.fire({
      title: "Lisans Bilgisi Güncelle",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <b>${name}</b> isimli envanterin lisans bilgilerini güncelleyeceksiniz.
          </div>
          <input id="swal-input-start" type="date" value="${lisansStart ? new Date(lisansStart).toISOString().slice(0,10) : ""}" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" placeholder="Lisans Başlangıç">
          <input id="swal-input-end" type="date" value="${lisansEnd ? new Date(lisansEnd).toISOString().slice(0,10) : ""}" style="width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" placeholder="Lisans Bitiş">
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Güncelle",
      cancelButtonText: "İptal",
      preConfirm: () => {
        return {
          lisansStartDate: document.getElementById("swal-input-start").value,
          lisansEndDate: document.getElementById("swal-input-end").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(`http://localhost:5000/api/inventories/lisans/${_id}`, result.value, {
            withCredentials: true,
            credentials: "include",
          });
          Swal.fire("Başarılı!", "Lisans bilgileri başarıyla güncellendi.", "success");
          window.location.reload();
        } catch (error) {
          Swal.fire("Hata!", "Güncelleme işlemi başarısız oldu.", "error");
        }
      }
    });
  };

  // Silme fonksiyonu
  const handleDelete = async () => {
    setShowActions(false);
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
      focusCancel: true
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/inventories/${_id}`, {
          withCredentials: true,
          credentials: 'include'
        });
        Swal.fire('Silindi!', 'Kayıt başarıyla silindi.', 'success');
        window.location.reload();
      } catch (error) {
        Swal.fire('Hata!', 'Silme işlemi başarısız oldu.', 'error');
      }
    }
  };

  // Takip et fonksiyonu
  const handleFollow = async () => {
    setShowActions(false);
    try {
      await axios.post(
        `http://localhost:5000/api/inventories/follow`,
        { id: _id },
        { withCredentials: true, credentials: "include" }
      );
      Swal.fire("Başarılı!", "Envanter takip edildi.", "success");
    } catch (error) {
      Swal.fire("Hata!", "İşlem başarısız oldu.", "error");
    }
  };

    const handleUnfollow = async () => {
    setShowActions(false);
    try {
      await axios.post(
        `http://localhost:5000/api/inventories/unfollow`,
        { id: _id },
        { withCredentials: true, credentials: "include" }
      );
      Swal.fire("Başarılı!", "Envanter takibi bırakıldı.", "success");
    } catch (error) {
      console.log(error);
    }
  };

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showActions && !e.target.closest(".inventoryCardActions") && !e.target.closest(".inventoryCardMenu")) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showActions]);

  return (
    <div className="inventoryCardContainer">
      <div className="inventoryCard">
        <div className="inventoryCardInfo flex1">{device}</div>
        <div className="inventoryCardInfo flex1">{project}</div>
        <div className="inventoryCardInfo flex1">{sites}</div>
        <div className="inventoryCardInfo flex3">{name}</div>
        <div className="inventoryCardInfo flex2">{link}</div>
        <div className="inventoryCardInfo flex2">{productSerialNumber}</div>
        <div className="inventoryCardInfo flex2">
          {lisansStart ? new Date(lisansStart).toLocaleDateString("tr-TR") : ""}
        </div>
        <div className="inventoryCardInfo flex2">
          {lisansEnd ? new Date(lisansEnd).toLocaleDateString("tr-TR") : ""}
        </div>
        <div className="inventoryCardInfo flex1">{location}</div>
        <select
          className="inventoryCardSelect flex2"
          value={statusState}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="maintenance">maintenance</option>
          <option value="retired">retired</option>
        </select>
        {/* Menü butonu */}
        <div
          className={`inventoryCardMenu flex1 ${showActions ? "open" : ""}`}
          onClick={() => setShowActions(!showActions)}
        >
          {showActions ? "✖" : "•••"}
        </div>
        {/* Action butonları */}
        <div className={`inventoryCardActions ${showActions ? "show" : ""}`}>
          <div className="actionItem" onClick={handleUpdate}>
            <i className="fas fa-edit"></i> Update
          </div>
          <div className="actionItem" onClick={handleLisans}>
            <i className="fas fa-edit"></i> Lisans Change
          </div>
          {!followed && (<div className="actionItem" onClick={handleFollow}>
            <i className="fas fa-bell"></i> Follow
          </div>)}
          {followed && (<div className="actionItem" onClick={handleUnfollow}>
            <i className="fas fa-bell"></i> Unfollow
          </div>)}
          <div className="actionItem delete" onClick={handleDelete}>
            <i className="fas fa-trash"></i> Delete
          </div>
        </div>
      </div>
    </div>
  );
};

FullInventory.propTypes = {
  name: PropTypes.string,
  link: PropTypes.string,
  productSerialNumber: PropTypes.string,
  _id: PropTypes.string.isRequired,
  sites: PropTypes.string,
  project: PropTypes.string,
  device: PropTypes.string,
  location: PropTypes.string,
  status: PropTypes.string,
  lisansStart: PropTypes.string,
  lisansEnd: PropTypes.string,
};

FullInventory.defaultProps = {
  name: "Unnamed Project",
  link: "No Link",
  productSerialNumber: "No PSN",
  _id: "",
  sites: "",
  project: "",
  device: "",
  location: "",
  status: "",
  lisansStart: "",
  lisansEnd: "",
};

export default FullInventory;