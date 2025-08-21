import { useEffect, useState } from 'react';
import './BaseModal.css';
import axios from 'axios';

const AddSitesToUser = ({ userId, onClose }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSites, setSelectedSites] = useState([]);
  const [projeList, setProjeList] = useState([])
  const [siteList, setSiteList] = useState([])

  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setSelectedSites([]);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/sites/${project._id}/missing?userId=${userId}`,
        {
          withCredentials: true,
          credentials: 'include'
        }
      );
      setSiteList(response.data)
    } catch (error) {
      console.log(error.response);
    }
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
      setProjeList(response.data)
    } catch (error) {
      console.log(error.response);
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSiteToggle = (siteId) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  useEffect(() => {
    setSelectedSites([]);
  }, [selectedProject]);

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/admin/addSites/${userId}`,{
          projectId: selectedProject._id,
          sites : selectedSites
        },
        {
          withCredentials: true,
          credentials: 'include'
        }
      );
      setProjeList(response.data)
    } catch (error) {
      console.log(error.response);
    }

    console.log('Proje:', selectedProject);
    console.log('Eklenen Siteler:', selectedSites);
    onClose(true);
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Site Ekle</h2>
          <button className="close-btn" onClick={() => onClose(false)}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="two-column-layout">
            {/* Sol Kolon - Kullanıcının Projeleri */}
            <div className="column">
              <h3 className="column-header">Projelerim</h3>
              <div className="list-container">
                 {projeList && projeList.length > 0 ? (
                    projeList.map(project => (
                        <div 
                        className={`list-item ${selectedProject?._id === project._id ? 'selected' : ''}`}
                        onClick={() => handleProjectSelect(project)}
                        >
                        {project.name}
                        </div>
                    ))
                  ) : (
                    <div>Proje bulunamadı</div>
                  )}
              </div>
            </div>

            {/* Sağ Kolon - Eklenebilir Siteler */}
            <div className="column">
              <h3 className="column-header">
                {selectedProject ? `${selectedProject.name} - Siteler` : 'Proje Seçin'}
              </h3>
              <div className="list-container">
                {siteList && siteList.length > 0 ? (
                  siteList.map(site => (
                    <label className="checkbox-item">
                      <input type="checkbox" 
                        checked={selectedSites.includes(site._id)}
                        onChange={() => handleSiteToggle(site._id)}/>
                      {site.name}
                    </label>
                  ))
                ):(
                    <div>Site bulunamadı</div>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={() => onClose(false)}>
            İptal
          </button>
          <button 
            className="modal-btn modal-btn-primary" 
            onClick={handleSave}
            disabled={!selectedProject || selectedSites.length === 0}
          >
            Site Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSitesToUser;