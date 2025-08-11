import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import SiteCard from "../cards/siteCard";
import "./sites.css";
import "./common.css";
import SearchBar from "../components/SearchBar";

const Sites = () => {
    const [search, setSearch] = useState("")
    const [siteName, setSiteName] = useState("")
    const [siteId, setSiteId] = useState("")
    const [matchedSiteName, setMatchedSiteName] = useState('');
    const { projectId } = useParams(); // URL'den projectId'yi al
    const dispatch = useDispatch() 
    const sites = useSelector((state) => state.sites || []);
    const [clearSites, setClearSites] = useState([])
    const [projectName, setprojectName] = useState("")

    useEffect(() => {
        if (search) {
            const searchLower = search.toLocaleLowerCase('tr');
            
            const filtered = sites.filter(site => 
                site.name.toLocaleLowerCase('tr').includes(searchLower)
            );

            setClearSites(filtered);
        } else {
            setClearSites(sites);
        }
    }, [search, sites]);
    
    useEffect(() => {
        if (projectId) {
            const foundProject = sites.find(site => site._id === projectId);
            setMatchedSiteName(foundProject ? foundProject.name : '');
        } else {
            setMatchedSiteName('');
        }
    }, [siteId, sites]);

    const createSite = async () => {
        try {
            if (siteName.length < 2) {
                alert("Site name must be at least 2 characters long.");
                return;
            }
            
            if (sites.some(site => site.name === siteName)) {
                alert("site name must be unique.");
                return;
            }
            const response = await axios.post('http://localhost:5000/api/sites', 
                { name: siteName, projectId: projectId });
            console.log("Site created:", { name: siteName, projectId: projectId });
            fetchSites()
            setSiteName(""); // Input'u temizle
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Error creating project: " + error.message);
        }
    };

    const deleteSite = async () => {
        try {       
            if (!siteId) {
                alert("Please enter a project ID to delete.");
                return;
            }
            if (!(sites.some(site => site._id === siteId))) {
                alert("Project ID not found.");
                return;
            }
            const response = await axios.delete(`http://localhost:5000/api/sites/${siteId}`);
            console.log("Site deleted:", response.data);
            await fetchSites();
            setSiteId(""); // Input'u temizle
        } catch (error) {
            console.error("Error deleting site:", error);    
            alert("Error deleting site: " + error.message);
        }}

    const fetchSites = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/sites/${projectId}`);
            setprojectName(response.data.project[0].name)
            console.log(response.data)
            dispatch({ type: "SET_SITES", payload: response.data.sites });
        } catch (error) {
            console.error("Error fetching site:", error);
        }
    };
    useEffect(() => {
        fetchSites();
    }, [projectId]);
  return (
    <>
        <div className="sitesContainer">
            <div className="navBar">
                <div className="createDelet">
                    <div className="createDeletBody">
                        <div className="headerName">
                            Site Name : {siteName}
                        </div>
                        <input className="creatDeletInput" type="text" placeholder="Enter site name"
                        onChange={(e)=>{setSiteName(e.target.value)}} value={siteName}/>
                    </div>
                    <div className="createDeletBtn" onClick={createSite}>Create Site</div>
                </div>
                <div className="createDelet">
                    <div className="createDeletBody">
                        <div className="headerName">
                            Site ID : {matchedSiteName}
                        </div>
                        <input className="creatDeletInput" type="text" placeholder="Enter site ID to delete" 
                        onChange={(e)=>{setSiteId(e.target.value)}} value={siteId}/>
                    </div>
                    <div className="createDeletBtn" onClick={deleteSite}>Delete Site</div>
                </div>
            </div>
            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)}/>
        <h2>Project: {projectName}</h2>
            {clearSites.length > 0 ? (
                <div className="sitesList">
                    {clearSites.map((site) => (
                        <SiteCard key={site._id} name={site.name} _id={site._id} projectId={site.ProjectId}
                        inventoryCount={site.inventoryCount} projectName={"afnslofbnasfnawş"}/>
                    ))}
                </div>
            ) : (
                <p>No sites found</p>
            )}
        </div>
    </>
  );
}
export default Sites;