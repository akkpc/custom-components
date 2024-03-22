import { Button, ButtonProps } from 'antd'

interface Props {
    buttonType: "primary" | "secondary" | "error",
}

export function KFButton({ buttonType, children, loading, ...rest }: Props & ButtonProps) {
    return (

        <Button
            loading={loading}
            className={`kf-button kf-button-${buttonType}`}
            type="primary"
            {...rest}
        >{children}</Button>
    )
}
