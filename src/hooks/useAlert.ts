import { message } from "antd";

function useAlert() {
    const [messageApi, alertContext] = message.useMessage();

    function showInvalidInputError(text: string) {
        messageApi.open({
            type: 'error',
            content: text,
        });
    };

    function showSuccessInput(text: string) {
        messageApi.open({
            type: 'success',
            content: text,
        });
    };

    return {
        alertContext,
        showInvalidInputError,
        showSuccessInput
    }
}

export {
    useAlert
};
