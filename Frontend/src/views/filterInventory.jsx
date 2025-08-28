import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import InventoryCard from "../cards/inventoryCard";
import "./inventory.css";
import FullInventory from "../cards/fullInventory";
import SearchBar from "../components/SearchBar";

const FilterInventory = () => {
    const [search, setSearch] = useState("")
    const [clearInventory, setClearInventory] = useState([])
    const [inventory, setInventory] = useState([])
    const [category, setCategory] = useState("all")
    const [setsortControl, setsetsortControl] = useState(false)
    const [selectStatus, setSelectStatus] = useState("all")
    const [selectDevice, setSelectDevice] = useState("all")
    const fetchInventory = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/filter/inventory`,{
                withCredentials: true,
                credentials: 'include'
            });
            console.log("Inventories:", response.data);
            setInventory(response.data)
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };    

    const searchFunction = () => {
        let filteredList = [];
        if (search) {
            const searchLower = search.toLocaleLowerCase('tr').trim();
            if (category=="all" || category===null){
                const filtered = inventory.filter(item => {
                    return item.name.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.siteName.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.projectName.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.location.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.productSerialNumber.toLocaleLowerCase('tr').includes(searchLower) ||
                           item.link.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="name"){
                const filtered = inventory.filter(item => {
                    return item.name.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="site"){
                const filtered = inventory.filter(item => {
                    return item.siteName.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="project"){
                const filtered = inventory.filter(item => {
                    return item.projectName.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="location"){
                const filtered = inventory.filter(item => {
                    return item.location.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="PSN"){
                const filtered = inventory.filter(item => {
                    return item.productSerialNumber.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }else if(category=="link"){
                const filtered = inventory.filter(item => { 
                    return item.link.toLocaleLowerCase('tr').includes(searchLower);
                });
                filteredList = filtered;
            }
        } else {                          
            filteredList = inventory;
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
    }, [search, inventory, category, selectStatus, selectDevice]);


    

    useEffect(() => {
        fetchInventory();
    }, []);

    const sortInventory = () => {

    };

  return (
    <>
        <div className="inventoryContainer">
            {category}
            <div className="inventoryFilterBar">
                <SearchBar value={search} onChange={(e) => setSearch(e.target.value)}/>
                <select name="inputFilter" id="00" onChange={(e)=>{setCategory(e.target.value)}}>
                    <option className="inputFilterOption" value="all">All</option>
                    <option className="inputFilterOption" value="name">Name</option>
                    <option className="inputFilterOption" value="site">Site</option>
                    <option className="inputFilterOption" value="project">Project</option>
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
                    <div className="inventoryHeaderItem flex1">Project</div>
                    <div className="inventoryHeaderItem flex1">Site</div>
                    <div className="inventoryHeaderItem flex3" >Name</div>
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
                    <div className="inventoryHeaderItem flex2">Actions</div>
                </div>
            </div>
            {clearInventory.length > 0 ? (
                <div className="inventoryList">
                    {clearInventory.map((item) => (
                        <FullInventory key={item._id} name={item.name} link={item.link} 
                        device={item.device} location={item.location} status={item.status}
                        productSerialNumber={item.productSerialNumber} _id={item._id} 
                        sites={item.siteName} project={item.projectName}/>
                    ))}
                </div>
            ) : (
                <p>No inventory found</p>
            )}
        </div>
    </>
  );
}
export default FilterInventory;