export const inventoryReducer = (state = [], action) => {
    switch (action.type) {
        case 'SET_INVENTORIES':
            return action.payload;
        case 'ADD_INVENTORY':
            return [...state, action.payload];
        case 'UPDATE_INVENTORY':
            return state.map(inventory =>
                inventory.id === action.payload.id ? action.payload : inventory
            );
        case 'DELETE_INVENTORY':
            return state.filter(inventory => inventory.id !== action.payload);
        default:
            return state;
    }
};

export default inventoryReducer;

// Action Creators
export const addInventory = (inventory) => ({
    type: 'ADD_INVENTORY',
    payload: inventory
});

export const updateInventory = (inventory) => ({
    type: 'UPDATE_INVENTORY',
    payload: inventory
});

export const deleteInventory = (inventoryId) => ({
    type: 'DELETE_INVENTORY',
    payload: inventoryId
});

export const setInventories = (inventories) => ({
    type: 'SET_INVENTORIES',
    payload: inventories     
});