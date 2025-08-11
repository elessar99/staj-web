const initialState = {
    name: '',
    ProjectId: '',
    _id: ''
};

export const siteReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SITE':
            return {
                name: action.payload.name,
                ProjectId: action.payload.ProjectId, // Proje ID'si
                _id: action.payload._id // Veya id, veri yapınıza göre
            };
        default:
            return state;
    }
};

export default siteReducer;

// Action Creators
export const setSite = (site) => (
    {
    type: 'SET_SITE',
    payload: {
        name: site.name,
        ProjectId: site.ProjectId, // Proje ID'si
        _id: site._id // API'den gelen veri yapısına göre ayarlayın
    }
});
