import React, { Ref } from 'react';
import { Form, Input, Checkbox, Button, Radio } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

type ActionFormProp = {
    form: Ref<any>;
    initialValues: Record<string, any>;
};

function ActionForm({ form, initialValues }: ActionFormProp) {
    const { t } = useTranslation('actionForm');
    return (
        <Form autoComplete="off" form={form} initialValues={initialValues}>
            <FormItem label={t('name')} field="name" rules={[{ required: true }]}>
                <Input style={{ width: 270 }} placeholder={t('please enter query name') || ''} />
            </FormItem>
        </Form>
    );
}

export default ActionForm;
