import {useRoutes} from "react-router-dom"

import "./Router.css";
import Home from "../views/home";
import Projects from "../views/projects";
import Sites from "../views/sites";
import Inventory from "../views/inventory";
import FilterInventory from "../views/filterInventory";
import FilterSite from "../views/filterSite";
import Authorization from "../views/authorization";

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
                path: '/admin/authorization',
                element: <Authorization/>
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