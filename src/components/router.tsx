import {
    createBrowserRouter
} from "react-router-dom";
import { BarChart } from "../pages/BarChart";
import { BasicChart } from "../pages/BasicChart";
import UICalender from "../pages/Calender";
import { LineChart } from "../pages/LineChart";
import { QuestionTab } from "../pages/QuestionTab";
import { TemplateQuestionnaire } from "../pages/TemplateQuestionnaire";
import { Stepper } from "../pages/Stepper";
import { AccordionTable } from "../pages/Table";
import { AccordionTableWeightage } from "../pages/Table_Weightage";

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
        path: "/a",
        element: <Rest />
    }
]);

export {
    router
};
