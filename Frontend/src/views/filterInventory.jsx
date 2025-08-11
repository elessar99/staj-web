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
    const fetchInventory = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/filter/inventory`);
            console.log("Inventories:", response.data);
            setInventory(response.data)
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };
    // useEffect(() => {
    //     if (search) {
    //         const searchLower = search.toLocaleLowerCase('tr');
            
    //         const filtered = inventory.filter(i => 
    //             i.name.toLocaleLowerCase('tr').includes(searchLower)
    //         );

    //         setClearInventory(filtered);
    //     } else {
    //         setClearInventory(inventory);
    //     }
    // }, [search, inventory]);

    useEffect(() => {
        if (search) {
            const searchLower = search.toLocaleLowerCase('tr');
            
            const filtered = inventory.filter(item => {
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
            setClearInventory(inventory);
        }
    }, [search, inventory]);

    useEffect(() => {
        fetchInventory();
    }, []);
  return (
    <>
        <div className="inventoryContainer">
            {search}
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)}/>
            {clearInventory.length > 0 ? (
                <div className="inventoryList">
                    {clearInventory.map((item) => (
                        <FullInventory key={item._id} name={item.name} link={item.link} 
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