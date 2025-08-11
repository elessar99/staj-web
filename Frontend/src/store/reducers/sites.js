export const sitesReducer = (state = [], action) => {
    switch (action.type) {
        case 'SET_SITES':
            return action.payload;
        case 'ADD_SITE':
            return [...state, action.payload];
        case 'UPDATE_SITE':
            return state.map(site =>
                site.id === action.payload.id ? action.payload : site
            );
        case 'DELETE_SITE':
            return state.filter(site => site.id !== action.payload);
        default:
            return state;
    }
};

export default sitesReducer;

// Action Creators
export const addSite = (site) => ({
    type: 'ADD_SITE',
    payload: site
});

export const updateSite = (site) => ({
    type: 'UPDATE_SITE',
    payload: site
});

export const deleteSite = (siteId) => ({
    type: 'DELETE_SITE',
    payload: siteId
});

export const setSites = (sites) => ({
    type: 'SET_SITES',
    payload: sites
});