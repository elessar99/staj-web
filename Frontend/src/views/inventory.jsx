import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import InventoryCard from "../cards/inventoryCard";
import "./inventory.css";
import SearchBar from "../components/SearchBar";

const Inventory = () => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState("")
    const [clearInventory, setClearInventory] = useState([])
    const { siteId } = useParams(); 
    const inventories = useSelector((state) => state.inventories || []);
    const [inventoryName, setInventoryName] = useState("");
    const [inventoryLink, setInventoryLink] = useState("");
    const [productSerialNumber, setProductSerialNumber] = useState("");
    const [inventoryDevice, setInventoryDevice] = useState("");
    const [inventoryLocation, setInventoryLocation] = useState("");
    const [inventoryStatus, setInventoryStatus] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [addItem, setAddItem] = useState(false);
    const [uploadExcel, setUploadExcel] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleChangeAddItem = () => {
        setAddItem(!addItem);
        if (uploadExcel) setUploadExcel(false);
    };

    const handleChangeUploadExcel = () => {
        setUploadExcel(!uploadExcel);
        if (addItem) setAddItem(false);
    };

    useEffect(() => {
        if (search) {
            const searchLower = search.toLocaleLowerCase('tr');
            
            const filtered = inventories.filter(item => {
            // Tüm string özelliklerde arama yap
            return Object.values(item).some(value => {
                if (typeof value === 'string') {
                return value.toLocaleLowerCase('tr').includes(searchLower);
                }
                return false;
            });
            });

            setClearInventory(filtered);
        } else {
            setClearInventory(inventories);
        }
    }, [search, inventories]);


    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
        alert('Lütfen bir dosya seçin');
        return;
        }
        await inventoryUpload();
    };

    const inventoryUpload = async () => {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('siteId', siteId);

        try {
            const response = await axios.post(`http://localhost:5000/api/upload/`, formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }
            )
            console.log("File uploaded successfully:", response.data);
            alert("File uploaded successfully");
            fetchInventory();
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file: " + error.message);
        }
    };


    const createInventory = async () => {
        try {
            // Validasyonlar
            if (inventoryName.length < 2) {
            alert("Inventory name must be at least 2 characters long.");
            return;
            }
            if (inventoryLink.length === 0) {
            alert("Link cannot be empty.");
            return;
            }
            if (productSerialNumber.length === 0) {
            alert("Serial number cannot be empty.");
            return;
            }
            // Benzersizlik kontrolü (isteğe bağlı)
            if (inventories.some(inv => inv.name === inventoryName)) {
            alert("Inventory name must be unique.");
            return;
            }
            if (inventories.some(inv => inv.productSerialNumber === productSerialNumber)) {
            alert("Inventory name must be unique.");
            return;
            }
            // IP adresi validasyonu (şemanızdaki regex'e göre)
            const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipRegex.test(inventoryLink)) {
            alert("Please enter a valid IP address.");
            return;
            }
            const response = await axios.post('http://localhost:5000/api/inventories', {
                device: inventoryDevice,
                name: inventoryName,
                link: inventoryLink,
                productSerialNumber: productSerialNumber,
                location: inventoryLocation,
                status: inventoryStatus,
                siteId: siteId // useParams'tan gelen siteId

            },{
                withCredentials: true,
                credentials: 'include'
            });
            console.log("Inventory created:", response.data);
            // State'leri temizle
            setInventoryName("");
            setInventoryLink("");
            setProductSerialNumber("");
            // Envanter listesini güncelle
            dispatch({ type: "ADD_INVENTORY", payload: response.data });

            window.location.reload();

        } catch (error) {
            console.error("Error creating inventory:", error);
            alert("Error creating inventory: " + (error.response?.data?.message || error.message));
        }
        };

    const fetchInventory = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/inventories/${siteId}`,{
                withCredentials: true,
                credentials: 'include'
            });
            console.log("Inventories:", response.data);
            dispatch({ type: "SET_INVENTORIES", payload: response.data });
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    useEffect(() => {
        fetchInventory();
    }, [siteId]);
  return (
    <>
        <div className="inventoryContainer">
            <div className="inventoryHeaderBar">
                <div className="inventoryAddBtn" onClick={handleChangeAddItem}>Add Item</div>
                <div className="inventoryAddBtn" onClick={handleChangeUploadExcel}>Upload Excel</div>
            </div>
            <div className="navBar">
                {addItem && (<div className="addInventory">
                    <div className="inventoryAddBody">
                        <div className="inventoryInputBar">
                            <input className="creatDeletInput" type="text" placeholder="Enter device name" 
                            onChange={(e)=>{setInventoryDevice(e.target.value)}} value={inventoryDevice}/>
                        </div>
                        <div className="inventoryInputBar">
                            <input className="creatDeletInput" type="text" placeholder="Enter name" 
                            onChange={(e)=>{setInventoryName(e.target.value)}} value={inventoryName}/>
                        </div>
                        <div className="inventoryInputBar">
                            <input className="creatDeletInput" type="text" placeholder="Enter link" 
                            onChange={(e)=>{setInventoryLink(e.target.value)}} value={inventoryLink}/>
                        </div>
                        <div className="inventoryInputBar">
                            <input className="creatDeletInput" type="text" placeholder="Enter PSN" 
                            onChange={(e)=>{setProductSerialNumber(e.target.value)}} value={productSerialNumber}/>
                        </div>
                        <div className="inventoryInputBar">
                            <input className="creatDeletInput" type="text" placeholder="Enter location" 
                            onChange={(e)=>{setInventoryLocation(e.target.value)}} value={inventoryLocation}/>
                        </div>
                    </div>
                    <div className="createDeletBtn" onClick={createInventory}>Add Item</div>
                </div>)}
                {uploadExcel && (<div className="excelUpload">
                    <div className="excelUploadBody">
                        <div className="headerName">
                            Excel Upload
                        </div>
                        <input className="creatDeletInput" type="file" onChange={handleFileChange}/>
                    </div>
                    <div className="createDeletBtn" onClick={handleUpload}>Upload Excel</div>
                </div>)}
            </div>
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)}/>
            <div className="inventoryHeader">
                <div className="inventoryHeaderBar">
                    <div className="inventoryHeaderItem flex1">Device</div>
                    <div className="inventoryHeaderItem flex3">Name</div>
                    <div className="inventoryHeaderItem flex2">Link</div>
                    <div className="inventoryHeaderItem flex2">PSN</div>
                    <div className="inventoryHeaderItem flex1">Location</div>
                    <div className="inventoryHeaderItem flex2">Status</div>
                    <div className="inventoryHeaderItem flex1">Actions</div>
                </div>
            </div>
            {clearInventory.length > 0 ? (
                <div className="inventoryList">
                    {clearInventory.map((item) => (
                        <InventoryCard key={item._id} device={item.device} name={item.name} link={item.link} productSerialNumber={item.productSerialNumber} location={item.location} status={item.status} _id={item._id}/>
                    ))}
                </div>
            ) : (
                <p>No inventory found</p>
            )}
        </div>
    </>
  );
}
export default Inventory;