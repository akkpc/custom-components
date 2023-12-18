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

const router = createBrowserRouter([
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
        path: "qna_tab",
        element: <QuestionTab/>
    }
]);

export {
    router
}