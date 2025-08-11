import { use, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import ProjectCard from "../cards/projectCard";
import "./project.css";
import "./common.css";
import { useState } from "react";
const Projects = () => {
    const projects = useSelector((state) => state.projects || []);
    const [projectName, setProjectName] = useState("")
    const [projectId, setProjectId] = useState("")
    const [matchedProjectName, setMatchedProjectName] = useState('');
    useEffect(() => {
        if (projectId) {
            const foundProject = projects.find(project => project._id === projectId);
            setMatchedProjectName(foundProject ? foundProject.name : '');
        } else {
            setMatchedProjectName('');
        }
    }, [projectId, projects]);
    
    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/projects');
            console.log(response.data)
            dispatch({ type: "SET_PROJECTS", payload: response.data });
        } catch (error) {
            console.error("Error fetching projects:", error);
            dispatch({ type: "SET_PROJECTS_ERROR", payload: error.message });
        }
    };
    const createProject = async () => {
        try {
            if (projectName.length < 3) {
                alert("Project name must be at least 3 characters long.");
                return;
            }
            
            if (projects.some(project => project.name === projectName)) {
                alert("Project name must be unique.");
                return;
            }
            const response = await axios.post('http://localhost:5000/api/projects', { name: projectName });
            dispatch({ type: "ADD_PROJECT", payload: response.data });
            window.location.reload()
            setProjectName(""); // Input'u temizle
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Error creating project: " + error.message);
        }
    };

    const deleteProject = async () => {
        try {       
            if (!projectId) {
                alert("Please enter a project ID to delete.");
                return;
            }
            if (!(projects.some(project => project._id === projectId))) {
                alert("Project ID not found.");
                return;
            }
            const response = await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
            console.log("Project deleted:", response.data);
            await fetchProjects();
            setProjectId(""); // Input'u temizle
        } catch (error) {
            console.error("Error deleting project:", error);    
            alert("Error deleting project: " + error.message);
        }}
    const dispatch = useDispatch();

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="projects-container">
            <div className="navBar">
                <div className="createDelet">
                    <div className="createDeletBody">
                        <div className="headerName">
                            Proje Name : {projectName}
                        </div>
                        <input className="creatDeletInput" type="text" placeholder="Enter project name" 
                        value={projectName}
                        onChange={(e)=>{setProjectName(e.target.value)}}/>
                    </div>
                    <div className="createDeletBtn" onClick={createProject}>Create Project</div>
                </div>
                <div className="createDelet">
                    <div className="createDeletBody">
                        <div className="headerName">
                            Proje Name : {matchedProjectName}
                        </div>
                        <input className="creatDeletInput" type="text" placeholder="Enter project ID to delete" 
                        onChange={(e)=>{setProjectId(e.target.value)}} value={projectId}/>
                    </div>
                    <div className="createDeletBtn" onClick={deleteProject}>Delete Project</div>
                </div>
            </div>
            
            {projects.length > 0 ? (
                <div className="projects-list">
                    {projects.map((project) => (
                        <ProjectCard key={project._id} name={project.name} id={project._id} 
                        siteCount={project.siteCount} inventoryCount={project.totalInventoryCount}/>
                    ))}
                </div>
            ) : (
                <p>No projects found</p>
            )}
        </div>
    );
};

export default Projects;