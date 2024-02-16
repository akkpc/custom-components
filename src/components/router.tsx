import {
    createBrowserRouter
} from "react-router-dom";
import { BarChart } from "../pages/BarChart";
import { BasicChart } from "../pages/BasicChart";
import UICalender from "../pages/Calender";
import { LineChart } from "../pages/LineChart";
import { QuestionTab } from "../pages/QuestionTab";
import { SourcingTemplate } from "../pages/SourcingTemplate";
import { Stepper } from "../pages/Stepper";
import { SupplierResponsePage } from "../pages/SupplierResponsePage";
import { AccordionTable } from "../pages/Table";
import { AccordionTableWeightage } from "../pages/Table_Weightage";
import { TemplateQuestionnaire } from "../pages/TemplateQuestionnaire";

function Rest() {
    return(
        <div>
            Hello
            <button onClick={() => {
                console.log("ndffnkjdbfhjkd ")
                alert("Anfijdfns")
            }} >fnkdfs</button>
        </div>
    )
}

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
        path: "/custom-components/calendar",
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
        path: "/add_template_question",
        element: <TemplateQuestionnaire />
    },
    {
        path: "/stepper",
        element: <Stepper />
    },
    {
        path: "/weightage",
        element: <AccordionTableWeightage />
    },
    {
        path: "/modify_sourcing_templates",
        element: <SourcingTemplate />
    },
    {
        path: "/c",
        element: <SupplierResponsePage/>
    }
]);

export {
    router
};