import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import SiteCard from "../cards/siteCard";
import "./sites.css";
import "./common.css";
import SearchBar from "../components/SearchBar";

const FilterSite = () => {
    const [sites, setSites] = useState([])
    const [clearSites, setClearSites] = useState([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        if (search) {
            const searchLower = search.toLocaleLowerCase('tr');
            
            const filtered = sites.filter(item => {
            // Tüm string özelliklerde arama yap
            return Object.values(item).some(value => {
                if (typeof value === 'string') {
                return value.toLocaleLowerCase('tr').includes(searchLower);
                }
                return false;
            });
            });

            setClearSites(filtered);
        } else {
            setClearSites(sites);
        }
    }, [search, sites]);

    const fetchSites = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/filter/site`,{
                withCredentials: true,
                credentials: 'include'
            });
            console.log(response.data)
            setSites(response.data)
        } catch (error) {
            console.log("Error fetching site:", error);
        }
    };
    useEffect(() => {
        fetchSites();
    }, []);
  return (
    <>  
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)}/>
        <div className="sitesContainer">
            {clearSites.length > 0 ? (
                <div className="sitesList">
                    {clearSites.map((site) => (
                        <SiteCard key={site._id} name={site.name} _id={site._id} projectId={site.ProjectId}
                        projectName={site.projectName} inventoryCount={site.inventoryCount}/>
                    ))}
                </div>
            ) : (
                <p>No sites found</p>
            )}
        </div>
    </>
  );
}
export default FilterSite;