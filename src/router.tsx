import {
    Link,
    createBrowserRouter
} from "react-router-dom";
import UICalender from "./components/Calender";
import { LineChart } from "./components/LineChart";

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
]);

export {
    router
}