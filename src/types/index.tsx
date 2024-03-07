export interface SourcingMaster {
    _id: string;
    Name: string;
    _created_by: {
        _id: string;
        Name: string;
        Kind: string;
    };
    _modified_by: {
        _id: string;
        Name: string;
        Kind: string;
    };
    _created_at: string;
    _modified_at: string;
    _flow_name: string;
    _application_id: string;
    _flow_type: string;
    _doc_version: string;
    _current_step: string;
    _current_assigned_to: {
        _id: string;
        Name: string;
        Kind: string;
    }[];
    _status: string;
    _stage: number;
    _root_process_instance: string;
    _submitted_at: string;
    _request_number: number;
    _counter: number;
    _last_completed_step: string;
    _progress: number;
    Event_Name: string;
    Event_Type: string[];
    Event_Short_Description: string;
    Category: string;
    Budget: string;
    Project: {
        Project: string;
        Status: string;
        _id: string;
        Name: string;
    };
    RFP_Start_Date: string;
    RFP_End_Date: string;
    Supplier_Clarification_Window_Start_Date: string;
    Supplier_Clarification_Window_End_Date: string;
    Weightage_Applicable: string;
    Scoring_Scale: string;
    Evaluator_1: {
        Name: string;
        Email_address: string;
        _id: string;
    };
    Evaluator_2: {
        Name: string;
        Email_address: string;
        _id: string;
    };
    Evaluator_3: {
        Name: string;
        Email_address: string;
        _id: string;
    };
    Evaluation_Start_Date: string;
    Evaluation_End_Date: string;
    Awarding_Communication: string;
    Allow_multiple_bids_for_RFQ: string;
    Compute_Savings: string;
    Sealed_Bid: string;
    Single_source_event: string;
    Accept_only_quotes_less_than_previous_quote: string;
    Choose_Template: string;
    Choose_Template_1: string;
    Current_Stage: string;
    RSVP_Start_Date: string;
    RSVP_End_Date_3: string;
    Applicable_commercial_info: string[];
    Consider: string;
    Event_Number: string;
    RFP_Template_ids: string;
    RFP_Choosen_Templates: string;
    Current_Status: string;
    "Table::Add_Existing_Suppliers": {
        _id: string;
        _created_by: {
            _id: string;
            Name: string;
            Kind: string;
        };
        _modified_by: {
            _id: string;
            Name: string;
            Kind: string;
        };
        _created_at: string;
        _modified_at: string;
        Supplier_Name_1: {
            Name: string;
            Email_1: string;
            _id: string;
        };
        First_Name_1: string;
        Email_2: string;
    }[];
    "Table::RFQ_Configuration": {
        _id: string;
        _created_by: {
            _id: string;
            Name: string;
            Kind: string;
        };
        _modified_by: {
            _id: string;
            Name: string;
            Kind: string;
        };
        _created_at: string;
        _modified_at: string;
        Item: string;
        Item_Description: string;
        Unit_of_Measure: string;
        Request_Quote_For: string;
        Quantity: number;
        sourcing_event_id: string;
    }[];
    _current_context: {
        _context_current_step: string;
        _context_assigned_to: {
            _id: string;
            Name: string;
            Kind: string;
        }[];
        _context_action_info: any[];
        NodeType: string;
        _context_assigned_at: string;
        _context_activity_id: string;
        _context_activity_instance_id: string;
        _context_is_step_reassigned: boolean;
        _context_last_self_picked_by: any;
    }[];
    _meta_version: string;
};
