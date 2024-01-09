import {
    Link,
    createBrowserRouter
} from "react-router-dom";
import UICalender from "./components/Calender";
import { LineChart } from "./components/LineChart";
import { BarChart } from "./components/BarChart";
import { BasicChart } from "./components/BasicChart";
import { AccordionTable } from "./components/Table";
import { QuestionTab } from "./components/QuestionTab";
import { Grid } from "./components/Grid";
import { SideBar } from "./components/SideBar";

const router = createBrowserRouter([
    {
        path: "/custom-components",
        element: <AccordionTable />
    },

    {
        path: "/",
        // element: <div>hello</div>,
        element: <AccordionTable />
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
    },
    {
        path: "/qna_tab",
        element: <QuestionTab/>
    },
    {
        path: "/sidebar",
        element: <SideBar/>
    }
]);

export {
    router
}