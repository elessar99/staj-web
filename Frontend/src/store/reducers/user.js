const initialState  = {
    email:"",
    userName: '',
}


export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                email: action.payload.email,
                userName: action.payload.userName
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
