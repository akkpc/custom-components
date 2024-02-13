import { Button, Card, Collapse, Input, Modal, Typography } from 'antd';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { getUniqueString, parseJSON } from '../helpers';
import { borderColor, buttonDarkBlue, primaryBackground, questionnaireBackground } from '../helpers/colors';
import { useAlert } from '../hooks/useAlert';
import { QuestionCard } from '../components/QuestionCard';
import { CaretRightOutlined } from '@ant-design/icons';
const KFSDK = require('@kissflow/lowcode-client-sdk')

type EventSection = {
  Sourcing_Event_Section_ID: string;
  Section_Sequence: number;
  Section_ID: string;
  Section_Name: string;
  Sourcing_Event_ID: string;
  Template_ID: string;
  Event_ID: string;
  _id: string;
};

export type Question = {
  _id: string;
  Question_ID: string;
  Question: string;
  Response_Type: string;
  Weightage: number;
  Dropdown_options?: {
    Name: string;
    _id: string;
  }[],
  Template_ID: string;
};

type EventQuestion = {
  Sourcing_Event_Question_ID: string;
  Template_ID: string;
  Section_ID: string;
  Event_ID: string;
  Sourcing_Event_ID: string;
  Question_ID: string;
  Question: string;
  _id: string;
};

export type Template = {
  _id: string;
  Sourcing_Event_Template__ID: string,
  Sourcing_Event_ID: string,
  Event_ID: string,
  Event_Name: string,
  Template_ID: string,
  Template_Name: string;
}

type Dataform = {
  template: string,
  section: string,
  question: string,
  sectionFilter: any,
  questionFilter: any
}

const appBarHeight = 50;
export function SourcingTemplate() {
  const [sections, setSections] = useState<EventSection[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [editActiveIndex, setEditActiveIndex] = useState<string>();
  const [activeSection, setActiveSection] = useState<string>();
  const [activeTemplate, setActiveTemplate] = useState<string>();
  const [sourcingEventId, setSourcingEventId] = useState("");
  const [openDiscardAlert, setOpenDiscardAlert] = useState(false);
  const { alertContext, showInvalidInputError, showSuccessInput } = useAlert();
  const prevQuestionState = useRef(questions);

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.popup.getAllParameters();
      if (allParams.Sourcing_Event_ID) {
        setSourcingEventId(allParams.Sourcing_Event_ID)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (sourcingEventId) {
        await getTemplatesBySourcingEvent();
      }
    })()
  }, [sourcingEventId])

  useEffect(() => {
    (async () => {
      if (activeTemplate) {
        await getSectionsByTemplate();
      }
    })()
  }, [activeTemplate])

  useEffect(() => {
    (async () => {
      if (activeSection) {
        const newQuestions = await getQuestionsBySection();
        prevQuestionState.current = JSON.parse(JSON.stringify(newQuestions));
        setQuestions(newQuestions);
      }
    })()
  }, [activeSection])

  useEffect(() => {
    if (questions && KFSDK?.app) {
      (async () => {
        console.log("isUnsavedQuestion : ", await KFSDK.app.getVariable("isUnsavedQuestion"))
        await KFSDK.app.setVariable({
          isUnsavedQuestion: true
        })
      })()
    }
  }, [questions])

  async function getTemplatesBySourcingEvent() {
    const templatesResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Templates_A01/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "OR": [
                  {
                    "LHSField": "Sourcing_Event_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": sourcingEventId,
                    "RHSField": null,
                    "LHSAttribute": null,
                    "RHSAttribute": null
                  }
                ]
              }
            ]
          }
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    const templates: Template[] = templatesResponse.Data;
    setTemplates(templates)
    if (templates.length > 0) {
      setActiveTemplate(templates[0].Template_ID)
    }
  }

  async function getSectionsByTemplate() {
    const sectionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "AND": [
                  {
                    "LHSField": "Sourcing_Event_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": sourcingEventId,
                    "RHSField": null,
                    "LHSAttribute": null,
                    "RHSAttribute": null
                  },
                  {
                    "LHSField": "Template_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": activeTemplate,
                    "RHSField": null,
                    "LHSAttribute": null,
                    "RHSAttribute": null
                  }
                ]
              }
            ]
          }
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    const sections: EventSection[] = sectionResponse.Data;
    setSections(sections)
    if (sections.length > 0) {
      setActiveSection(sections[0].Sourcing_Event_Section_ID)
    }
  }

  async function getQuestionsBySection() {
    const questionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [{
              "AND": [
                {
                  "LHSField": "Section_ID",
                  "Operator": "EQUAL_TO",
                  "RHSType": "Value",
                  "RHSValue": activeSection,
                  "RHSField": null,
                  "LHSAttribute": null,
                  "RHSAttribute": null
                },
                {
                  "LHSField": "Sourcing_Event_ID",
                  "Operator": "EQUAL_TO",
                  "RHSType": "Value",
                  "RHSValue": sourcingEventId,
                  "RHSField": null,
                  "LHSAttribute": null,
                  "RHSAttribute": null
                }
              ]
            }]
          }
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    let questions: Question[] = questionResponse.Data;
    questions = questions.map((question) => {
      if (question.Dropdown_options) {
        question.Dropdown_options = parseJSON(question.Dropdown_options as any);
      }
      return question;
    })
    return questions;
  }

  async function createSection(sectionName: string) {
    const newSection = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify([{
          Section_Name: sectionName,
          Section_Sequence: sections.length + 1,
          Sourcing_Event_ID: sourcingEventId,
          Event_ID: "",
          Event_Name: "",
          Template_ID: "",
          Section_ID: "",
          _is_created: true
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
    setActiveSection(newSection[0]._id)
    setEditActiveIndex(newSection[0]._id)
  }

  function calculateDelta(current: Question[], prev: Question[]) {
    const delta = []
    let prevQuestionIndex: number[] = []
    for (let i = 0; i < current.length; i++) {
      let currentQ = current[i];
      const index = prev.findIndex((q) => q.Question_ID == currentQ.Question_ID);

      if (index >= 0) {
        const prevState = prev[index];
        prevQuestionIndex.push(index);
        let changed = false;

        if (prevState.Question == currentQ.Question && prevState.Response_Type == currentQ.Response_Type) {
          if (currentQ.Response_Type == "single_select" && currentQ.Dropdown_options) {
            if (prevState.Dropdown_options?.length == currentQ.Dropdown_options?.length) {
              for (let j = 0; j < prevState.Dropdown_options?.length; j++) {
                if (prevState.Dropdown_options[j].Name != currentQ.Dropdown_options[j].Name) {
                  changed = true;
                  break;
                }
              }
            } else {
              changed = true;
            }
          }
        } else {
          changed = true;
        }
        if (changed) {
          delta.push({
            ...currentQ,
            Dropdown_options: currentQ.Response_Type == "single_select" ? JSON.stringify(currentQ.Dropdown_options) : null,
            Template_ID: sourcingEventId
          })
        }
      } else {
        delta.push({
          ...currentQ,
          _id: undefined,
          Question_ID: undefined,
          _is_created: true,
          Dropdown_options: currentQ.Response_Type == "single_select" ? JSON.stringify(currentQ.Dropdown_options) : null,
          Template_ID: sourcingEventId
        })
      }
    }

    const deletedDelta = prev.filter((_, index) => !prevQuestionIndex.includes(index)).map(({ _id }) => ({ _id }))

    return {
      delta,
      deletedDelta
    };
  }

  function validateInput(current: Question[]) {
    const invalidIds = []
    for (let i = 0; i < current.length; i++) {
      const currentQ = current[i]
      let valid = false;
      if (currentQ.Question && currentQ.Response_Type) {
        if (currentQ.Response_Type == "single_select") {
          if (currentQ.Dropdown_options && currentQ.Dropdown_options?.length > 0) {
            valid = true
          }
        } else {
          valid = true;
        }
      }
      if (!valid) {
        invalidIds.push(currentQ.Question_ID);
      }
    }
    return invalidIds;
  }

  async function saveQuestionChanges(data: any[]) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }).catch((err: any) => console.log("cannot fetch", err))
    // await getQuestionsBySection();
  }

  async function updateSection(sectionId: string, sectionName: Question) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/${sectionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          Section_Name: sectionName,
          _id: sectionId
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function deleteSection(sectionId: string) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Sections_A00/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify([{
          _id: sectionId
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function deleteQuestions(data: any[]) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Questions_A00/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }).catch((err: any) => console.log("cannot fetch", err))
  }

  async function onSave() {
    const invalidIds = validateInput(questions);
    if (invalidIds.length > 0) {
      showInvalidInputError("Please fill all the empty fields");
    } else {
      const { deletedDelta, delta } = calculateDelta(questions, prevQuestionState.current);
      console.log("delta", delta, deletedDelta)
      if (delta.length > 0) {
        await saveQuestionChanges(delta);
      }
      if (deletedDelta.length > 0) {
        await deleteQuestions(deletedDelta);
      }
      // setActiveSection((val) => val);
      prevQuestionState.current = questions;
      showSuccessInput("Question saved successfully");
    }
  }

  return (
    <div>
      {alertContext}
      {sourcingEventId ?
        <div style={{
          display: "flex",
          flexDirection: "row",
          height: window.innerHeight - appBarHeight,
        }} >
          <div className='scrollable-container'
            style={{ height: window.innerHeight - appBarHeight, overflow: "scroll", width: "35%", borderRight: `1px solid ${borderColor}`, backgroundColor: primaryBackground, padding: 5 }} >
            <Collapse
              defaultActiveKey={activeTemplate}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              onChange={(templateId) => {
                console.log("templateId" , templateId)
                setActiveTemplate(templateId[0]);
              }}
              activeKey={activeTemplate ? [activeTemplate] : activeTemplate}
              items={templates.map(({ Template_Name, Template_ID, _id }, index) => (
                {
                  key: Template_ID,
                  label: Template_Name,
                  children: (
                    <div style={{ margin: 10 }} >
                      <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Sections</Typography>
                      {
                        sections.map((section, index) =>
                          <div key={index} style={{ marginTop: 10 }} >
                            <Section
                              index={index + 1}
                              section_name={section.Section_Name}
                              rest={section}
                              isEditActive={section.Section_ID == editActiveIndex}
                              isActive={activeSection == section.Section_ID}
                              onClick={() => {
                                const { deletedDelta, delta } = calculateDelta(questions, prevQuestionState.current);
                                if (delta.length > 0 || deletedDelta.length > 0) {
                                  setOpenDiscardAlert(true);
                                } else {
                                  setActiveSection(section.Section_ID)
                                }
                              }}
                              onPressEnter={async (e) => {
                                let sectionName = e.currentTarget.value
                                await updateSection(section.Section_ID, sectionName);
                                setEditActiveIndex("")
                              }}
                              onEdit={() => setEditActiveIndex(section.Section_ID)}
                              onDelete={async () => deleteSection(section.Section_ID)}
                            />
                          </div>
                        )
                      }
                      <Button
                        onClick={async () => {
                          await createSection("");
                        }}
                        style={{ color: "rgba(0, 60, 156, 1)", backgroundColor: "rgba(238, 245, 255, 1)", borderColor: "rgba(0, 60, 156, 1)", marginTop: 10 }} >Add Section</Button>
                    </div>
                  )
                }
              ))}
            >
            </Collapse>
          </div>
          <div className='scrollable-container' style={{ height: window.innerHeight - appBarHeight, overflow: "scroll", width: "100%", backgroundColor: questionnaireBackground }}>
            <div style={{ margin: 10 }} >
              <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Commodity enquiries questionnaires</Typography>
              {
                questions && questions.map((question, index) => {
                  return (
                    <div key={index} style={{ marginTop: 10 }} >
                      <QuestionCard
                        index={index}
                        question={question}
                        setQuestions={setQuestions}
                      />
                    </div>
                  )
                })
              }
              {
                <Button
                  onClick={async () => {
                    // await createQuestion("", "");
                    setQuestions((prevQuestions: any[]) => {
                      return [...prevQuestions, {
                        Question_ID: getUniqueString(),
                        Response_Type: "short_text",
                        Weightage: 0,
                        Question: "",
                        Section_ID: activeSection
                      }]
                    })
                  }}
                  style={{ color: "rgba(0, 60, 156, 1)", backgroundColor: "rgba(238, 245, 255, 1)", borderColor: "rgba(0, 60, 156, 1)", marginTop: 10 }}
                >Add Questionnaire</Button>
              }
            </div>
          </div>
        </div> : <div>Loading....</div>}
      <div style={{
        backgroundColor: "white",
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: appBarHeight,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center"
      }} >
        <div style={{ padding: 20 }} >
          <Button onClick={() => setOpenDiscardAlert(true)} style={{ marginRight: 3, backgroundColor: primaryBackground }}  >Discard</Button>
          <Button
            style={{ backgroundColor: buttonDarkBlue, color: "white" }}
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>
      <Modal
        title="Discard Changes"
        open={openDiscardAlert}
        onOk={() => {
          setQuestions(prevQuestionState.current)
          setOpenDiscardAlert(false)
        }}
        onCancel={() => {
          setOpenDiscardAlert(false)
        }}
      >
        <p>Are you sure want to discard changes ?</p>
      </Modal>
    </div>
  )
}

function Section(props: { index: number, section_name: string, rest: any, isEditActive: boolean, isActive: boolean, onPressEnter: (e: any) => void, onEdit: () => void, onDelete: () => void, onClick: () => void }) {
  const { index, section_name, isEditActive, isActive, onPressEnter, onEdit, onDelete, onClick } = props;
  return (
    <div key={index} >
      <Card style={{ borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 5, backgroundColor: isActive ? "rgba(238, 245, 255, 1)" : "white" }}
        onClick={onClick}
      >
        <div>
          <Typography style={{ fontSize: 12 }}  >Section {index}</Typography>
          {
            isEditActive ?
              <Input onBlur={onPressEnter} onPressEnter={onPressEnter} placeholder={section_name} style={{ fontSize: 15 }} /> :
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} >
                <Typography style={{ fontSize: 15 }} >{section_name}</Typography>
                {isActive && <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
                  <img onClick={onEdit} style={{ marginRight: 5, cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/edit.svg'} />
                  <img onClick={onDelete} style={{ cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/trash.svg'} />
                </div>}
              </div>
          }
        </div>
      </Card>
    </div>
  )
}

function Template(props: { templateName: string, index: number, onClick: () => void }) {
  const { index, templateName, onClick } = props;
  return (
    <Card onClick={onClick} key={index} >
      <div>
        <Typography>Template - {templateName}</Typography>
      </div>
    </Card>
  )
}

export function RoundedIcon(props: { children: any, onClick: () => void }) {
  const { children, onClick } = props;
  return (
    <div onClick={onClick} style={{ backgroundColor: "rgba(222, 234, 255, 1)", borderRadius: "100%", padding: 3, cursor: "pointer" }} >
      {children}
    </div>
  )
}