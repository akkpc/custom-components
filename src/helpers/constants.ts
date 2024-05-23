const baseUrl = `https://development-lcnc-kpc.kissflow.com`

const sourcingSection = "Sourcing_Sections_A00"
const sourcingQuestion = "Sourcing_Questions_A00"
const SourcingMaster = "Sourcing_Master_A00"
const Applicable_commercial_info = "Applicable_commercial_info"
const Applicable_Commercial_Info_Weightages = "Applicable_Commercial_Info_Weightages"
const lineItemTableKey = "Table::RFQ_Configuration"
const sourcingSupplierTasks = "Sourcing_Supplier_Tasks_A00"
const supplierResponses = "Supplier_Responses_A00"
const SupplierLineItem = "Sourcing_Supplier_Line_Items_A00"
const supplierResponseTemplate = "Sourcing_Supplier_Response_Templat_A00"
const supplierResponseSection = "Sourcing_Supplier_Response_Section_A00"
const supplierResponseQuestion = "Sourcing_Supplier_Response_Questio_A01"
const supplierResponseCommercials = "Sourcing_Supplier_Line_Items_A00"
const supplierAwardingForm = "Sourcing_Supplier_Awarding_A00"
const lineItemTypes = ["RFP", "RFQ"]

const dataforms = {
    supplierResponses,
    sourcingSupplierTasks,
    sourcingSection,
    sourcingQuestion,
    supplierResponseTemplate,
    supplierResponseSection,
    supplierResponseQuestion,
    supplierResponseCommercials,
    supplierAwardingForm
}
const processes = {
    SourcingMaster,
    SupplierLineItem
}

const Commercial_Details = "Commercial_Details"
const Line_Items = "Line_Items"
const Questionnaire = "Questionnaire"


const leafNodes = ["question", "line_item_info","line_item_price", "line_item_params"]
const rootNodes = ["questionnaire", "section", "commercial_details", "line_items", "line_item"]

const questionnaireComponentId = "Container_VRSTDYbWW"
const lineComponentId = "Container_ZUfUF-TIt"


export {
    Applicable_Commercial_Info_Weightages, Applicable_commercial_info,
    Commercial_Details, Line_Items, Questionnaire,
    baseUrl, dataforms, leafNodes, lineItemTableKey, processes, rootNodes, lineItemTypes,
    questionnaireComponentId, lineComponentId
}

