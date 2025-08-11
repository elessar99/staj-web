const initialState  = {
    name: '',
    _id: ''
}


export const projectReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_PROJECT':
            return {
                name: action.payload.name,
                _id: action.payload.id
            };
        default:
            return state;
    }
};

export default projectReducer;

export const setProject = (projects) => ({
    type: 'SET_PROJECT',
    payload: projects     
});
