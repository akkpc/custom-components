import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Typography } from 'antd';
import { useState } from 'react';
import { QuestionCard } from './QuestionCard';

const sections = [
  { id: 0, text: 'One', color: '#616AFF' },
  { id: 1, text: 'Two', color: '#2DBAE7' },
  { id: 2, text: 'Three', color: '#fd4e4e' }
]

const questions = [
  { id: 0, text: 'Question 1', color: '#616AFF' },
  { id: 1, text: 'Question 2', color: '#2DBAE7' },
  { id: 2, text: 'Question 3', color: '#fd4e4e' }
]

export function SideBar() {
  const [items, setItems] = useState(sections)
  const [editActiveIndex, setEditActiveIndex] = useState<number>();
  const [activeSection, setActiveSection] = useState(0);

  return (
    <Row>
      <Col span={6}>
        <div style={{ margin: 10 }} >
          <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Sections</Typography>
          {
            items.map((section, index) =>
              <div style={{ marginTop: 5 }} >
                <Section
                  index={index}
                  section_name={section.text}
                  rest={section}
                  isEditActive={section.id == editActiveIndex}
                  isActive={activeSection == section.id}
                  onClick={() => setActiveSection(section.id)}
                  onPressEnter={(e) => {
                    let value = e.currentTarget.value

                    setEditActiveIndex(-1)
                    let newItem = items.map((item) => {
                      if (item.id == editActiveIndex) {
                        return {
                          ...item,
                          text: value
                        }
                      }
                      return item
                    })
                    setItems(newItem)
                  }}
                  onEdit={() => setEditActiveIndex(section.id)}
                  onDelete={() => { }}
                />
              </div>
            )
          }
          <Button
            onClick={() => {
              setItems((oldItems) => ([...oldItems, {
                id: items.length + 1,
                text: 'fndjf',
                color: '#616AFF',
              }]))
              setEditActiveIndex(items.length + 1);
            }}
            style={{ color: "rgba(0, 60, 156, 1)", backgroundColor: "rgba(238, 245, 255, 1)", borderColor: "rgba(0, 60, 156, 1)", marginTop: 10 }} >Add Section</Button>
        </div>
      </Col>
      <Col span={18}>
        <div style={{ margin: 10 }} >
          <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Commodity enquiries questionnaires</Typography>
          {
            questions.map((question, index) => (
              <div style={{ marginTop: 5 }} >
                <QuestionCard index={index} />
              </div>
            ))
          }
        </div>
      </Col>
    </Row>
  )
}

function Section(props: { index: number, section_name: string, rest: any, isEditActive: boolean, isActive: boolean, onPressEnter: (e: any) => void, onEdit: () => void, onDelete: () => void, onClick: () => void }) {
  const { index, section_name, isEditActive, isActive, onPressEnter, onEdit, onDelete, onClick } = props;
  return (
    <div>
      <Card style={{ borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 0, backgroundColor: isActive ? "rgba(238, 245, 255, 1)" : "transparent" }}
        onClick={onClick}
      >
        <Typography style={{ fontSize: 12 }}  >Section {index}</Typography>
        {
          isEditActive ?
            <Input onBlur={onPressEnter} onPressEnter={onPressEnter} placeholder={section_name} style={{ fontSize: 15 }} /> :
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} >
              <Typography style={{ fontSize: 15 }} >{section_name}</Typography>
              <div style={{ display: "flex", justifyContent: "space-between" }} >
                <RoundedIcon onClick={onEdit} >
                  <EditOutlined style={{ color: "blue", margin: 5 }} />
                </RoundedIcon>
                <RoundedIcon onClick={onDelete}>
                  <DeleteOutlined style={{ color: "red", margin: 5 }} />
                </RoundedIcon>
              </div>
            </div>
        }
      </Card>
    </div>
  )
}


export function RoundedIcon(props: { children: any, onClick: () => void }) {
  const { children, onClick } = props;
  return (
    <div onClick={onClick} style={{ backgroundColor: "rgba(222, 234, 255, 1)", borderRadius: 60, padding: 3, cursor: "pointer" }} >
      {children}
    </div>
  )
}