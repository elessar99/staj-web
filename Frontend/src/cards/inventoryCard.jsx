import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "./inventoryCard.css";

const InventoryCard = ({
  name = "name",
  link = "link",
  productSerialNumber = "SerialNumber",
  _id,
  device = "device",
  location = "location",
  status = "status",
  lisansStart = "01.01.2000",
  lisansEnd = "01.01.2000",
}) => {
  const [statusState, setStatusState] = useState(status);
  const [showActions, setShowActions] = useState(false);

  /* ------------------ Fonksiyonlar ------------------ */

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

  const handleDelete = async () => {
    setShowActions(false);
    const result = await Swal.fire({
      title: "Envanter Silme Onayı",
      html: `
        <div style="text-align: left; line-height: 1.6; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <b>${name}</b> isimli envanter kaydını silmek üzeresiniz.
          </div>
          <div style="background: #f8f8f8; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;">
            <div><b>IP Adresi:</b> ${link}</div>
            <div><b>Seri Numarası:</b> ${productSerialNumber}</div>
          </div>
          <div style="margin-top: 20px; color: #d32f2f; font-weight: bold; font-size: 13px;">
            Bu işlem geri alınamaz!
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#757575",
      confirmButtonText: "Evet, Sil",
      cancelButtonText: "İptal",
      focusCancel: true,
      showCloseButton: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/inventories/${_id}`, {
          withCredentials: true,
          credentials: "include",
        });
        Swal.fire("Silindi!", "Kayıt başarıyla silindi.", "success");
        window.location.reload();
      } catch (error) {
        Swal.fire("Hata!", "Silme işlemi başarısız oldu.", "error");
      }
    }
  };

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

  const handleStatusChange = async (newStatus) => {
    const result = await Swal.fire({
      title: "Statü Değiştirme Onayı",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <b>${name}</b> durumu <b>${statusState}</b> → <b>${newStatus}</b> olarak değiştirilecek.
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, Değiştir",
      cancelButtonText: "İptal",
    });

    if (result.isConfirmed) {
      try {
        setStatusState(newStatus);
        await axios.patch(
          `http://localhost:5000/api/inventories/${_id}`,
          { status: newStatus },
          { withCredentials: true, credentials: "include" }
        );
        Swal.fire("Başarılı!", "Durum başarıyla güncellendi.", "success");
        window.location.reload();
      } catch (error) {
        setStatusState(status);
        Swal.fire("Hata!", "Durum güncellenirken bir hata oluştu.", "error");
      }
    }
  };

  /* ------------------ Dışarı tıklayınca menüyü kapat ------------------ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showActions && !e.target.closest(".inventoryCardActions") && !e.target.closest(".inventoryCardMenu")) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showActions]);

  /* ------------------ Render ------------------ */
  return (
    <div className="inventoryCardContainer">
      <div className="inventoryCard">
        <div className="inventoryCardInfo flex1">{device}</div>
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
          <div className="actionItem" onClick={handleFollow}>
            <i className="fas fa-bell"></i> Follow
          </div>
          <div className="actionItem delete" onClick={handleDelete}>
            <i className="fas fa-trash"></i> Delete
          </div>
        </div>
      </div>
    </div>
  );
};

InventoryCard.propTypes = {
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
