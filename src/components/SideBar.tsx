import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Input, Typography } from 'antd'
import { useState } from 'react'

const sections = [
  { id: 0, text: 'One', color: '#616AFF' },
  { id: 1, text: 'Two', color: '#2DBAE7' },
  { id: 2, text: 'Three', color: '#fd4e4e' }
]

export function SideBar() {
  const [items, setItems] = useState(sections)
  const [activeIndex, setActiveIndex] = useState<number>();

  return (
    <div style={{ width: 300 }} >
      <div style={{ margin: 5 }} >
        <Typography style={{ color: "rgba(97, 101, 108, 1)", fontSize: 18 }} >Sections</Typography>
        {
          items.map((section, index) => <Section index={index} section_name={section.text} rest={section} isActive={section.id == activeIndex}
            onPressEnter={(e) => {
              let value = e.currentTarget.value

              setActiveIndex(-1)
              let newItem = items.map((item) => {
                if (item.id == activeIndex) {
                  return {
                    ...item,
                    text: value
                  }
                }
                return item
              })
              setItems(newItem)
            }}
            onEdit={() => setActiveIndex(section.id)}
            onDelete={() => { }}
          />)
        }
        <Button
          onClick={() => {
            setItems((oldItems) => ([...oldItems, {
              id: items.length + 1,
              text: 'fndjf',
              color: '#616AFF',
            }]))
            setActiveIndex(items.length + 1);
          }}
          style={{ color: "rgba(0, 60, 156, 1)", backgroundColor: "rgba(238, 245, 255, 1)", borderColor: "rgba(0, 60, 156, 1)", marginTop: 10 }} >Add Section</Button>
      </div>
    </div>
  )
}

function Section(props: { index: number, section_name: string, rest: any, isActive: boolean, onPressEnter: (e: any) => void, onEdit: () => void, onDelete: () => void }) {
  const { index, section_name, isActive, onPressEnter, onEdit, onDelete } = props;
  return (
    <div style={{ marginTop: 5 }} >
      <Card style={{ borderRadius: 4, borderColor: "rgba(222, 234, 255, 1)", padding: 0 }} >
        <Typography style={{ fontSize: 12 }}  >Section {index}</Typography>
        {
          isActive ?
            <Input onPressEnter={onPressEnter} placeholder={section_name} style={{ fontSize: 15 }} /> :
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


function RoundedIcon(props: { children: any, onClick: () => void }) {
  const { children, onClick } = props;
  return (
    <div onClick={onClick} style={{ backgroundColor: "rgba(222, 234, 255, 1)", borderRadius: 50, margin: 3, cursor: "pointer" }} >
      {children}
    </div>
  )
}