import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface Props {
    loading: boolean;
}

export function KFLoader() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
    )
}
