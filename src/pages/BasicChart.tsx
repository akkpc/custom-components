
import React from 'react';
import { Line } from '@ant-design/charts';

const BasicChart: React.FC = () => {
  const data = [
    { name: '1991', age: 3 },
    { name: '1992', age: 4 },
    { name: '1993', age: 3.5 },
    { name: '1994', age: 5 },
    { name: '1995', age: 4.9 },
    { name: '1996', age: 6 },
    { name: '1997', age: 7 },
    { name: '1998', age: 9 },
    { name: '1999', age: 13 },
  ];

  const config = {
    data,
    width: window.innerWidth,
    height: 400,
    autoFit: false,
    xField: 'name',
    yField: 'age',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  // let chart;

  // // Export Image
  // const downloadImage = () => {
  //   chart?.downloadImage();
  // };

  // // Get chart base64 string
  // const toDataURL = () => {
  //   console.log(chart?.toDataURL());
  // };

  return (
    <div>
      <h1>Helloo Keerthana</h1>
    </div>
  );
};
export { BasicChart };