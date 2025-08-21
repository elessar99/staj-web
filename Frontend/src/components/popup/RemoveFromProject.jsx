import { useEffect, useState } from 'react';
import './BaseModal.css';
import axios from 'axios';

const RemoveFromProject = ({ userId, onClose }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectList, setProjectList] = useState([])

  const handlePermissionToggle = (project) => {
    setSelectedProject(prev => 
      prev && prev._id === project._id ? null : project
    );
    console.log(selectedProject)
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/remove/${userId}`,
        {
          withCredentials: true,
          credentials: 'include'
        }
      );
      setProjectList(response.data)
    } catch (error) {
      console.log(error.response);
    }
  }
  useEffect(() => {
    fetchProjects()
  }, [])

  const handleRemove = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/admin/removeProject/${userId}`,{
          projectId: selectedProject._id
        },
        {
          withCredentials: true,
          credentials: 'include'
        }
      );
      setProjectList(response.data)
    } catch (error) {
      console.log(error.response);
    }
    // Burada kaldırma işlemi yapılacak
    console.log('Kaldırılacak İzinler:', selectedProject);
    onClose(true);
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Projeden Kaldır</h2>
          <button className="close-btn" onClick={() => onClose(false)}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="column">
            <h3 className="column-header">Kullanıcı İzinleri</h3>
              <div className="list-container">
                {projectList && projectList.length > 0 ? (
                  projectList.map(project => (
                    <label key={project._id} className="checkbox-item">
                      <input 
                        type="radio" 
                        name="projectSelection" 
                        checked={selectedProject && selectedProject._id === project._id}
                        onChange={() => handlePermissionToggle(project)}
                      />
                      {project.name}
                    </label>
                  ))
                ) : (
                  <div>Proje bulunamadı</div>
                )}
              </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={() => onClose(false)}>
            İptal
          </button>
          <button 
            className="modal-btn modal-btn-danger" 
            onClick={handleRemove}
          >
            Kaldır
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveFromProject;