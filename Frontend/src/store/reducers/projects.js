export const projectsReducer = (state = [], action) => {
    switch (action.type) {
        case 'SET_PROJECTS':
            return action.payload;
        case 'ADD_PROJECT':
            return [...state, action.payload];
        case 'UPDATE_PROJECT':
            return state.map(project =>
                project.id === action.payload.id ? action.payload : project
            );
        case 'DELETE_PROJECT':
            return state.filter(project => project.id !== action.payload);
        default:
            return state;
    }
}

export default projectsReducer;

export const addProject = (project) => ({
    type: 'ADD_PROJECT',
    payload: project
});
export const updateProject = (project) => ({
    type: 'UPDATE_PROJECT',
    payload: project
}); 
export const deleteProject = (projectId) => ({
    type: 'DELETE_PROJECT',
    payload: projectId
}); 
export const setProjects = (projects) => ({
    type: 'SET_PROJECTS',
    payload: projects     
});

