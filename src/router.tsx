import {
    Link,
    createBrowserRouter
} from "react-router-dom";
import UICalender from "./components/Calender";
import { LineChart } from "./components/LineChart";
import { BarChart } from "./components/BarChart";

const router = createBrowserRouter([
    {
        path: "/",
        element: <div>hello</div>,
    },
    {
        path: "/calendar",
        element: <UICalender />
    },
    {
        path: "/line-chart",
        element: <LineChart />,
    },
    {
        path: "/bar",
        element: <BarChart />,
    },
]);

export {
    router
}