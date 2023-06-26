import { Modal, Button, Space, Popconfirm } from '@arco-design/web-react';
import graphState from '../hooks/use-graph-state';
import { useTranslation } from 'react-i18next';

/**
 * It renders a modal that allows the user to change the relation of a link or delete the link
 * @param props - { editingLink, setEditingLink, setLinkDict }
 * @returns  Modal component
 */
export default function LinkModal(props) {
    const { editingLink, setEditingLink } = props;
    const { setLinkDict } = graphState.useContainer();
    const { t } = useTranslation('linkModal');

    const changeRelation = relation => {
        const { linkId, fieldId } = editingLink;
        setLinkDict(state => {
            return {
                ...state,
                [linkId]: {
                    ...state[linkId],
                    endpoints: state[linkId].endpoints.map(endpoint => {
                        if (endpoint.fieldId === fieldId) {
                            return {
                                ...endpoint,
                                relation,
                            };
                        }
                        if (relation === '*' && endpoint.fieldId !== fieldId) {
                            return {
                                ...endpoint,
                                relation: '1',
                            };
                        }
                        return endpoint;
                    }),
                },
            };
        });
        setEditingLink(null);
    };

    const removeLink = () => {
        const { linkId, fieldId } = editingLink;
        setLinkDict(state => {
            delete state[linkId];
            return { ...state };
        });
        setEditingLink(null);
    };

    return (
        <Modal
            title="Link"
            visible={!!editingLink}
            onCancel={() => setEditingLink(null)}
            footer={null}
            autoFocus={false}
            focusLock={false}
        >
            <Space
                style={{
                    width: '100%',
                    justifyContent: 'space-between',
                }}
            >
                <Space>
                    <label>{t('Change relation')}:</label>
                    <Button
                        type="primary"
                        onClick={() => {
                            changeRelation('1');
                        }}
                    >
                        {t('startPoint')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            changeRelation('*');
                        }}
                    >
                        {t('endpoint')}
                    </Button>
                </Space>
                <Popconfirm
                    title="Are you sure to delete this path?"
                    onOk={() => {
                        removeLink();
                    }}
                >
                    <Button>{t('Delete Path')}</Button>
                </Popconfirm>
            </Space>
        </Modal>
    );
}
