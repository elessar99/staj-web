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
    const [selectStatus, setSelectStatus] = useState("all")
    const [selectDevice, setSelectDevice] = useState("all")
    const [category, setCategory] = useState("all")
    const { siteId } = useParams(); 
    const inventories = useSelector((state) => state.inventories || []);
    const [inventoryName, setInventoryName] = useState("");
    const [inventoryLink, setInventoryLink] = useState("");
    const [productSerialNumber, setProductSerialNumber] = useState("");
    const [inventoryDevice, setInventoryDevice] = useState("server");
    const [inventoryLocation, setInventoryLocation] = useState("");
    const [inventoryStatus, setInventoryStatus] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [addItem, setAddItem] = useState(false);
    const [uploadExcel, setUploadExcel] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0);

    const searchFunction = () => {
        let filteredList = [];
        if (search) {
            const searchLower = search.toLocaleLowerCase('tr').trim();
            if (category=="all" || category===null){
                const filtered = inventories.filter(item => {
                    return item.name.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.location.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.productSerialNumber.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.link.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="name"){
                const filtered = inventories.filter(item => {
                    return item.name.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="location"){
                const filtered = inventories.filter(item => {
                    return item.location.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="PSN"){
                const filtered = inventories.filter(item => {
                    return item.productSerialNumber.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="link"){
                const filtered = inventories.filter(item => { 
                    return item.link.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }
        } else {                          
            filteredList = inventories;
        }
        if (selectStatus != "all"){
            const filtered = filteredList.filter(item => item.status === selectStatus);
            filteredList = filtered;
        }
        if (selectDevice != "all"){
            const filtered = filteredList.filter(item => item.device === selectDevice);
            filteredList = filtered;
        }
        setClearInventory(filteredList);
    }

    
    useEffect(() => {
        searchFunction();
    }, [search, inventories, category, selectStatus, selectDevice]);

    const handleChangeAddItem = () => {
        setAddItem(!addItem);
        if (uploadExcel) setUploadExcel(false);
    };

    const handleChangeUploadExcel = () => {
        setUploadExcel(!uploadExcel);
        if (addItem) setAddItem(false);
    };


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
                            <select name="device" id="device" className="inventoryInputBarSelect" onChange={(e)=>{setInventoryDevice(e.target.value)}} value={inventoryDevice}>
                                <option value="server">Server</option>
                                <option value="network">Network</option>
                            </select>
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
            <div className="inventoryFilterBar">
                <SearchBar value={search} onChange={(e) => setSearch(e.target.value)}/>
                <select name="inputFilter" id="00" onChange={(e)=>{setCategory(e.target.value)}}>
                    <option className="inputFilterOption" value="all">All</option>
                    <option className="inputFilterOption" value="name">Name</option>
                    <option className="inputFilterOption" value="location">Location</option>
                    <option className="inputFilterOption" value="PSN">PSN</option>
                    <option className="inputFilterOption" value="link">Link</option>
                </select>
            </div>
            <div className="inventoryHeader">
                <div className="inventoryHeaderBar">
                    <div className="inventoryHeaderItem flex1">
                        <select className="inventoryHeaderItemSelect" name="device" id="device" onChange={(e)=>{setSelectDevice(e.target.value)}}>
                            <option className="inventoryHeaderItemOption" value="all">All</option>
                            <option className="inventoryHeaderItemOption" value="server">Server</option>
                            <option className="inventoryHeaderItemOption" value="network">network</option>
                        </select>
                    </div>
                    <div className="inventoryHeaderItem flex3">Name</div>
                    <div className="inventoryHeaderItem flex2">Link</div>
                    <div className="inventoryHeaderItem flex2">PSN</div>
                    <div className="inventoryHeaderItem flex1">Location</div>
                    <div className="inventoryHeaderItem flex2">
                        <select className="inventoryHeaderItemSelect" name="status" id="status" onChange={(e)=>{setSelectStatus(e.target.value)}}>
                            <option className="inventoryHeaderItemOption" value="all">All</option>
                            <option className="inventoryHeaderItemOption" value="active">Active</option>
                            <option className="inventoryHeaderItemOption" value="inactive">Inactive</option>
                            <option className="inventoryHeaderItemOption" value="maintenance">Maintenance</option>
                            <option className="inventoryHeaderItemOption" value="retired">Retired</option>
                        </select>
                    </div>
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