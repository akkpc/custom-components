import {
    Link,
    createBrowserRouter
} from "react-router-dom";
import UICalender from "./components/Calender";
import { LineChart } from "./components/LineChart";
import { BarChart } from "./components/BarChart";
import { BasicChart } from "./components/BasicChart";
import { AccordionTable } from "./components/Table";

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
    {
        path: "/test/test",
        element: <BasicChart/>
    },
    {
        path: "/table",
        element: <AccordionTable />
    }
]);

export {
    router
}