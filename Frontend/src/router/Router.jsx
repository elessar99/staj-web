import {useRoutes} from "react-router-dom"
import "./Router.css";
import Projects from "../views/projects";
import Sites from "../views/sites";
import Inventory from "../views/inventory";
import FilterInventory from "../views/filterInventory";
import FilterSite from "../views/filterSite";
import Authorization from "../views/authorization";
import UserPage from "../views/userPage";
import Message from "../views/message";

const Router = () => {
    const routes = useRoutes(
        [
            {
                path: '/',
                element: <Projects/>
            },
            {
                path: '/:projectId/sites',
                element: <Sites/>
            },
            {
                path: '/:siteId/inventory',
                element: <Inventory/>
            },
            {
                path: '/filter/inventory',
                element: <FilterInventory/>
            },
            {
                path: '/filter/site',
                element: <FilterSite/>
            },
            {
                path: '/admin',
                element: <Authorization/>
            },
            {
                path: '/user',
                element: <UserPage/>
            },
            {
                path: '/messages/:userId',
                element: <Message/>
            },
            {
                path: '*',
                element: <div>
                    404 Not Found
                </div>
            }
        ]
    )
    return routes
}
export default Router