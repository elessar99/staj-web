import { applyMiddleware, combineReducers, createStore } from "redux";
import { thunk } from "redux-thunk"; // Değişiklik burada
import logger from "redux-logger";
import { persistReducer, persistStore } from "redux-persist";
import storage from 'redux-persist/lib/storage';
import projectsReducer from "./reducers/projects";
import projectReducer from "./reducers/project";
import sitesReducer from "./reducers/sites";
import siteReducer from "./reducers/site";
import inventoryReducer from "./reducers/inventory";
import userReducer from "./reducers/user";

const reducer = combineReducers({
    projects: projectsReducer,
    project: projectReducer,
    sites: sitesReducer,
    site: siteReducer,
    inventories: inventoryReducer,
    user: userReducer
});

const persistConfig = {
    key: "root",
    storage,
    version: 1,
    whitelist: ["project","page","site","user"],
    blacklist: ["projects","sites", "inventories"]
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = createStore(
    persistedReducer,
    applyMiddleware(thunk) // thunk artık doğru şekilde import edildi
);

export const persistor = persistStore(store);
export default reducer;