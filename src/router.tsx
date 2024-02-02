import {
    createBrowserRouter
} from "react-router-dom";
import { BarChart } from "./components/BarChart";
import { BasicChart } from "./components/BasicChart";
import UICalender from "./components/Calender";
import { LineChart } from "./components/LineChart";
import { QuestionTab } from "./components/QuestionTab";
import { SideBar } from "./components/SideBar";
import { Stepper } from "./components/Stepper";
import { AccordionTable } from "./components/Table";
import { AccordionTableWeightage } from "./components/Table_Weightage";

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
        element: <BasicChart />
    },
    {
        path: "/table",
        element: <AccordionTable />
    },
    {
        path: "/qna_tab",
        element: <QuestionTab />
    },
    {
        path: "/sidebar",
        element: <SideBar />
    },
    {
        path: "/stepper",
        element: <Stepper />
    },
    {
        path: "/weightage",
        element: <AccordionTableWeightage />
    }
]);

export {
    router
};
