import { Steps } from 'antd';
import React from 'react';

const description = 'This is a description.';
const Stepper: React.FC = () => (
  <Steps
    direction="vertical"
    current={0}
    items={[
      {
        title: 'Finished',
        description,
        subTitle: "difs"
      },
      {
        title: 'In Progress',
        description,
      },
      {
        title: 'Waiting',
        description,
      },
    ]}
    size="default"
  />
);

export {
    Stepper
};
