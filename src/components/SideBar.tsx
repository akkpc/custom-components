import { Button, Card, Col, Input, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { borderColor, buttonDarkBlue, primaryBackground, questionnaireBackground } from '../helpers/colors';
import { QuestionCard } from './QuestionCard';
import { template } from 'lodash';
const KFSDK = require('@kissflow/lowcode-client-sdk')

export type Section = {
  Section_ID: string;
  Section_Name: string;
  Section_Sequence: number;
  Template_ID: string;
  _id: string;
};

export type Question = {
  Question_ID: string;
  Question: string;
  Response_Type: string;
  Weightage: number;
  Section_ID: string;
  _id: string;
};

const appBarHeight = 50;
export function SideBar() {
  const [items, setItems] = useState<Section[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [editActiveIndex, setEditActiveIndex] = useState<string>();
  const [activeSection, setActiveSection] = useState<string>();
  const [templateId, setTemplateId] = useState("");

  useEffect(() => {
    (async () => {
      await KFSDK.initialize();
      let allParams = await KFSDK.app.page.popup.getAllParameters();
      if (allParams.template_id) {
        setTemplateId(allParams.template_id)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (templateId) {
        await getSectionsByTemplate();
      }
    })()
  }, [templateId])

  useEffect(() => {
    (async () => {
      if (activeSection) {
        await getQuestionsBySection();
      }
    })()
  }, [activeSection])

  async function getSectionsByTemplate() {
    const sectionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "OR": [
                  {
                    "LHSField": "Template_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": templateId,
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
    const sections: Section[] = sectionResponse.Data;
    setItems(sections)
    if (sections.length > 0) {
      setActiveSection(sections[0].Section_ID)
    }
  }

  async function getQuestionsBySection() {
    const questionResponse: any = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Questions_A00/allitems/list?&page_number=1&page_size=10000`,
      {
        method: "POST",
        body: JSON.stringify({
          Filter: {
            "AND": [
              {
                "OR": [
                  {
                    "LHSField": "Section_ID",
                    "Operator": "EQUAL_TO",
                    "RHSType": "Value",
                    "RHSValue": activeSection,
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
    const questions: Question[] = questionResponse.Data;
    setQuestions(questions)
  }

  async function createSection(sectionName: string) {
    const newSection = await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify([{
          Section_Name: sectionName,
          Section_Sequence: items.length + 1,
          Template_ID: templateId,
          _is_created: true
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
    setActiveSection(newSection[0]._id)
    setEditActiveIndex(newSection[0]._id)
  }

  async function createQuestion(questionName: string, responseType: string) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Questions_A00/batch`,
      {
        method: "POST",
        body: JSON.stringify([{
          Question: questionName,
          Response_Type: responseType,
          Weightage: 0,
          Section_ID: activeSection,
          Template_ID: templateId,
          _is_created: true
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getQuestionsBySection();
  }

  async function updateSection(sectionId: string, sectionName: Question) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/${sectionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          Section_Name: sectionName,
          _id: sectionId
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function updateQuestion(questionId: string, questionName: string, responseType: string) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Questions_A00/${questionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          Question: questionName,
          Response_Type: responseType
        })
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function deleteSection(sectionId: string) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Sections_A00/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify([{
          _id: sectionId
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getSectionsByTemplate();
  }

  async function deleteQuestion(questionId: string) {
    await KFSDK.api(`${process.env.REACT_APP_API_URL}/form/2/${KFSDK.account._id}/Sourcing_Template_Questions_A00/batch/delete`,
      {
        method: "POST",
        body: JSON.stringify([{
          _id: questionId
        }])
      }).catch((err: any) => console.log("cannot fetch", err))
    await getQuestionsBySection();
  }



  return (
    <div>
      {templateId ?
        <div style={{
          display: "flex",
          flexDirection: "row",
          height: window.innerHeight - appBarHeight,
        }} >
          <div className='scrollable-container'
            style={{ height: window.innerHeight - appBarHeight, overflow: "scroll", width: "35%", borderRight: `1px solid ${borderColor}`, backgroundColor: primaryBackground, padding: 5 }} >
            <div style={{ margin: 10 }} >
              <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Sections</Typography>
              {
                items.map((section, index) =>
                  <div style={{ marginTop: 10 }} >
                    <Section
                      index={index + 1}
                      section_name={section.Section_Name}
                      rest={section}
                      isEditActive={section.Section_ID == editActiveIndex}
                      isActive={activeSection == section.Section_ID}
                      onClick={() => setActiveSection(section.Section_ID)}
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
          </div>
          <div className='scrollable-container' style={{ height: window.innerHeight - appBarHeight, overflow: "scroll", width: "100%", backgroundColor: questionnaireBackground }}>
            <div style={{ margin: 10 }} >
              <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Commodity enquiries questionnaires</Typography>
              {
                questions && questions.map((question, index) => (
                  <div key={index} style={{ marginTop: 10 }} >
                    <QuestionCard
                      index={index}
                      question={question}
                      updateQuestion={updateQuestion}
                      deleteQuestion={deleteQuestion}
                    />
                  </div>
                ))
              }
              <Button
                onClick={async () => {
                  await createQuestion("", "");
                }}
                style={{ color: "rgba(0, 60, 156, 1)", backgroundColor: "rgba(238, 245, 255, 1)", borderColor: "rgba(0, 60, 156, 1)", marginTop: 10 }} >Add Questionnaire</Button>
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
          <Button style={{ marginRight: 3, backgroundColor: primaryBackground }}  >Discard</Button>
          <Button
            style={{ backgroundColor: buttonDarkBlue, color: "white" }}
          >Save</Button>
        </div>
      </div>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
                  <img style={{ marginRight: 5, cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/edit.svg'} />
                  <img style={{ cursor: "pointer" }} src={process.env.PUBLIC_URL + '/svgs/trash.svg'} />
                </div>
              </div>
          }
        </div>
      </Card>
    </div>
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