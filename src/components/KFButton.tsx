import { Button, ButtonProps, ConfigProvider } from 'antd'

interface Props {
    buttonType: "primary" | "secondary" | "error",
}

export function KFButton({ buttonType, children, ...rest }: Props & ButtonProps) {
    return (

        <Button
            className={`kf-button kf-button-${buttonType}`}
            type="primary"
            {...rest}
        >{children}</Button>
    )
}
