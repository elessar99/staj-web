const initialState  = {
    email:"",
    userName: '',
    isAdmin:"",
    id:""
}


export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                email: action.payload.email,
                userName: action.payload.userName,
                isAdmin: action.payload.isAdmin,
                id: action.payload._id
            };
        case 'RESET_USER':
            return state
        default:
            return state;
    }
};

export default userReducer;

export const setUser = (user) => ({
    type: 'SET_USER',
    payload: user     
});
