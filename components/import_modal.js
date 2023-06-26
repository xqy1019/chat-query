import { Modal, Notification, Select, Tabs } from '@arco-design/web-react';
import { Parser } from '@dbml/core';
import { useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import Editor from '@monaco-editor/react';
import graphState from '../hooks/use-graph-state';
import tableModel from '../hooks/table-model';
import { Typography } from '@arco-design/web-react';
import { map } from 'lodash';
import { sortBy } from 'lodash';
import { useEffect } from 'react';
import { useMemo } from 'react';
import ConnectDb from '@/client/api/connectDb';
import useSWRMutation from 'swr/mutation';

const TabPane = Tabs.TabPane;

import { Form, Input, Button, InputNumber } from '@arco-design/web-react';
import { Grid } from '@arco-design/web-react';
import { Message } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
const FormItem = Form.Item;

export function DBForm({
    form,
    slot = null,
    initialValues = {
        client: 'mysql2',
        host: '139.198.179.193',
        port: 32094,
        user: 'root',
        password: '123789',
        database: 'xyy',
    },
}) {
    const [loading, setLoading] = useState(false);
    const { trigger, isMutating } = useSWRMutation('ConnectDb', (_key, { arg }) => {
        setLoading(true);
        ConnectDb.create(arg)
            .then(
                ({ data }) => {
                    if (data?.status === 200) {
                        Message.success(t('Connection Succeeded'));
                    } else {
                        Message.error(t('Connection Failed'));
                    }
                },
                () => {
                    Message.error(t('Connection Failed'));
                }
            )
            .finally(() => {
                setLoading(false);
            });
    });
    const { t } = useTranslation('modal');

    return (
        <Form
            form={form}
            style={{ width: '100%' }}
            initialValues={initialValues}
            autoComplete="off"
            onValuesChange={(v, vs) => {}}
            onSubmit={v => {}}
            className="p-[20px]"
        >
            <FormItem label={t('Connection Information')} rules={[{ required: true }]}>
                <Grid.Row gutter={8}>
                    <Grid.Col span={12}>
                        <Form.Item field="host" rules={[{ required: true }]} className="mb-0">
                            <Input placeholder={t('Please Input IP')} />
                        </Form.Item>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Form.Item field="port" rules={[{ required: true }]} className="mb-0">
                            <Input placeholder={t('Please Input Port')} />
                        </Form.Item>
                    </Grid.Col>
                </Grid.Row>
            </FormItem>
            <Form.Item label={t('Database Type')} field="client" rules={[{ required: true }]}>
                <Grid.Row gutter={8}>
                    <Grid.Col span={12}>
                        <Form.Item field="client" rules={[{ required: true }]} className="mb-0">
                            <Select
                                allowClear
                                placeholder={t('Please Select')}
                                options={[
                                    {
                                        label: 'mysql',
                                        value: 'mysql2',
                                    },
                                ]}
                            ></Select>
                        </Form.Item>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Form.Item field="database" rules={[{ required: true }]} className="mb-0">
                            <Input placeholder={t('Please Input Database Name')} />
                        </Form.Item>
                    </Grid.Col>
                </Grid.Row>
            </Form.Item>
            <FormItem label={t('Account')} field="user" rules={[{ required: true }]}>
                <Input placeholder={t('Please Input Username')} />
            </FormItem>
            <FormItem label={t('Password')} field="password" rules={[{ required: true }]}>
                <Input placeholder={t('Please Input Database Password')} type="password" />
            </FormItem>
            {slot}
            <FormItem wrapperCol={{ offset: 5 }}>
                <Button
                    style={{ marginRight: 24 }}
                    onClick={() => {
                        form.resetFields();
                    }}
                >
                    {t('Clear')}
                </Button>
                <Button
                    type="primary"
                    style={{ marginRight: 24 }}
                    loading={loading}
                    onClick={() => {
                        trigger(form.getFields());
                    }}
                >
                    {t('Test Connection')}
                </Button>
            </FormItem>
        </Form>
    );
}

function bfs(nodes) {
    const oldNodes = Object.fromEntries(nodes.map(v => [v.id, v]));
    const visited = [];
    const nodeMap = new Map();
    let queue = [];

    // 广度优先搜索
    for (let i = 0; i < nodes.length; i++) {
        if (!nodeMap.has(nodes[i].id)) {
            nodeMap.set(nodes[i].id, nodes[i]);
            queue.push(nodes[i]);
            while (queue.length > 0) {
                const currNode = queue.shift();
                visited.push(currNode);
                // 遍历当前节点的所有关联节点
                for (const endpoint of currNode.endpoints) {
                    for (const refNode of endpoint) {
                        if (!nodeMap.has(refNode.ref)) {
                            queue.push(oldNodes[refNode.ref]);
                            queue = sortBy(queue, o => o.raw.relateLength * 1);
                            nodeMap.set(refNode.ref, oldNodes[refNode.ref]);
                        }
                    }
                }
            }
        }
    }
    return map(visited, ({ raw }) => raw);
}

/**
 * It's a modal that allows you to import a graph from a string
 * @returns Modal component
 */
export default function ImportModal({ showModal, onCloseModal, cb = _p => {}, type, importDBML }) {
    const { t } = useTranslation('modal');
    const { theme, setTableDict, setLinkDict, tableList } = graphState.useContainer();
    const { calcXY } = tableModel();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { trigger, isMutating, data } = useSWRMutation('getDbDBML', (_key, { arg }) => {
        setLoading(true);
        return ConnectDb.getDbDBML(arg)
            .then(
                ({ data }) => {
                    if (data?.status === 200) {
                        setValue(data?.data);
                        setImportType('dbml');
                        return data?.data;
                    } else {
                        Message.error();
                    }
                },
                () => {
                    Message.error();
                }
            )
            .finally(() => {
                setLoading(false);
            });
    });
    useEffect(() => {
        if (type === 1) {
            setImportType('dbml');
        } else if (type === 2) {
            setImportType('postgres');
        } else if (type === 3) {
            setImportType('db');
        }
    }, [type]);

    const [val, setValue] = useState('');
    const [importType, setImportType] = useState('dbml');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleOk = async (changeValue, handleCb, failCall) => {
        const value = changeValue || val;
        if (!value) {
            onCloseModal();
            return;
        }
        try {
            const result = await Parser.parse(value, importType);
            const graph = result.schemas[0];
            const tableDict = {};
            const linkDict = {};
            const tables = [...tableList];
            const tableNameMap = Object.fromEntries(graph.tables.map(v => [v.name, v]));
            bfs(
                sortBy(
                    graph.tables.map(v => {
                        let relateLength = 0;
                        return {
                            endpoints: v.fields
                                .map(t => {
                                    relateLength += t.endpoints.length;
                                    return t.endpoints.map(p => ({
                                        id: p.id,
                                        fieldNames: p.fieldNames,
                                        tableName: p.tableName,
                                        ref: tableNameMap[
                                            p.ref.endpoints.filter(
                                                port => port.tableName !== v.name
                                            )[0].tableName
                                        ].id,
                                    }));
                                })
                                .filter(item => item.length),
                            id: v.id,
                            raw: v,
                            relateLength: relateLength,
                        };
                    }),
                    o => o.relateLength * -1
                )
            ).forEach((table, _index) => {
                const id = nanoid();
                const [x, y] = calcXY(0, tables);
                const newTable = {
                    id,
                    name: table.name,
                    note: table.note,
                    x,
                    y,
                    fields: table.fields.map(field => {
                        const fieldId = nanoid();
                        return {
                            id: fieldId,
                            increment: field.increment,
                            name: field.name,
                            not_null: field.not_null,
                            note: field.note,
                            pk: field.pk,
                            unique: field.unique,
                            type: field.type.type_name.toUpperCase(),
                        };
                    }),
                };
                tableDict[id] = newTable;
                tables.push(newTable);
            });

            graph.refs.forEach(ref => {
                const id = nanoid();
                linkDict[id] = {
                    id,
                    endpoints: ref.endpoints.map(endpoint => {
                        const table = Object.values(tableDict || {}).find(
                            table => table.name === endpoint.tableName
                        );
                        return {
                            id: table.id,
                            relation: endpoint.relation,
                            fieldId: table.fields.find(
                                field => field.name === endpoint.fieldNames[0]
                            ).id,
                        };
                    }),
                };
            });

            setTableDict(state => ({
                ...state,
                ...tableDict,
            }));
            setLinkDict(state => ({
                ...state,
                ...linkDict,
            }));

            setValue('');
            onCloseModal();
            handleCb ? handleCb({ tableDict, linkDict }) : cb({ tableDict, linkDict });
        } catch (e) {
            console.log(e);
            Notification.error({
                title: 'Parse failed',
            });
            failCall && failCall();
        }
    };
    if (importDBML) {
        importDBML.current = handleOk;
    }
    const recordData = useRef();
    useEffect(() => {
        if (recordData.current !== data) {
            handleOk();
            recordData.current = data;
        }
    }, [data]);

    const editor = (
        <Editor
            className={`!mt-0 ${theme === 'dark' ? 'bg-[#1e1e1e]' : ' bg-[#fff]'} mt-[10px]`}
            language={importType === 'dbml' ? 'apex' : 'sql'}
            width="680px"
            height="60vh"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: 'on',
                accessibilitySupport: 'auto',
                autoIndent: false,
                automaticLayout: true,
                codeLens: true,
                colorDecorators: true,
                contextmenu: true,
                cursorBlinking: 'blink',
                cursorSmoothCaretAnimation: false,
                cursorStyle: 'line',
                disableLayerHinting: false,
                disableMonospaceOptimizations: false,
                dragAndDrop: false,
                fixedOverflowWidgets: false,
                folding: true,
                foldingStrategy: 'auto',
                fontLigatures: false,
                formatOnPaste: false,
                formatOnType: false,
                hideCursorInOverviewRuler: false,
                highlightActiveIndentGuide: true,
                links: true,
                mouseWheelZoom: false,
                multiCursorMergeOverlapping: true,
                multiCursorModifier: 'alt',
                overviewRulerBorder: true,
                overviewRulerLanes: 2,
                quickSuggestions: true,
                quickSuggestionsDelay: 100,
                readOnly: false,
                renderControlCharacters: false,
                renderFinalNewline: true,
                renderIndentGuides: true,
                renderLineHighlight: 'line',
                renderWhitespace: 'none',
                revealHorizontalRightPadding: 300,
                roundedSelection: true,
                rulers: [],
                scrollBeyondLastColumn: 5,
                scrollBeyondLastLine: true,
                selectOnLineNumbers: true,
                selectionClipboard: true,
                selectionHighlight: true,
                showFoldingControls: 'mouseover',
                smoothScrolling: false,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: true,
                wordSeparators: '~!@#$%^&*()-=+[{]}|;:\'",.<>/?',
                wordWrap: 'wordWrapColumn',
                wordWrapBreakAfterCharacters: '\t})]?|&,;',
                wordWrapBreakBeforeCharacters: '{([+',
                wordWrapBreakObtrusiveCharacters: '.',
                wordWrapColumn: 80,
                wordWrapMinified: true,
                wrappingIndent: 'none',
                // minimap: {
                //     autohide: true,
                // },
            }}
            onChange={setValue}
        />
    );

    const tabs = useMemo(() => {
        const result = [];
        if (type === 1 || !type) {
            result.push(
                <TabPane key="dbml" title="DBML" className="pt-0">
                    {editor}
                </TabPane>
            );
        } else if (type === 2 || !type) {
            result.push(
                <TabPane key="postgres" title="PostgreSQL">
                    {editor}
                </TabPane>,
                <TabPane key="mysql" title="MySQL">
                    {editor}
                </TabPane>,
                <TabPane key="mssql" title="MSSQL">
                    {editor}
                </TabPane>
            );
        } else if (type === 3 || !type) {
            result.push(
                <TabPane key="db" title="db">
                    <DBForm form={form} />
                </TabPane>
            );
        }
        return result;
    }, [type]);

    return (
        <Modal
            title={null}
            simple
            visible={showModal === 'import'}
            autoFocus={false}
            onOk={() => (type === 3 ? trigger(form.getFields()) : handleOk())}
            okText={t('Import')}
            cancelText={t('Close')}
            onCancel={() => onCloseModal()}
            style={{ width: 'auto' }}
            unmountOnExit
        >
            <h5 className="text-[20px] py-[10px] font-bold">{t('Import ERD Data Model')}</h5>
            <Tabs
                activeTab={importType}
                onChange={val => setImportType(val)}
                className="ring-2 ring-[#359c899a] p-0 w-[680px]"
            >
                {tabs}
            </Tabs>
        </Modal>
    );
}
