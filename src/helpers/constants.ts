const baseUrl = `https://development-lcnc-kpc.kissflow.com`

const sourcing_section_dataform = "Sourcing_Sections_A00"
const sourcing_question_dataform = "Sourcing_Questions_A00"
const SourcingMasterProcess = "Sourcing_Master_A00"
const Applicable_commercial_info = "Applicable_commercial_info"
const Applicable_Commercial_Info_Weightages = "Applicable_Commercial_Info_Weightages"
const lineItemTableKey = "Table::RFQ_Configuration"

const Commercial_Details = "Commercial_Details"
const Line_Items = "Line_Items"
const Questionnaire = "Questionnaire"


const leafNodes = ["question", "line_item_info", "line_item"]
const rootNodes = ["questionnaire", "section", "commercial_details", "line_items"]


export {
    Applicable_Commercial_Info_Weightages, Applicable_commercial_info,
    Commercial_Details, Line_Items, Questionnaire, SourcingMasterProcess, baseUrl, leafNodes, lineItemTableKey, rootNodes, sourcing_question_dataform,
    sourcing_section_dataform
}

