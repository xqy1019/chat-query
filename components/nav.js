import { Button, Space, Popconfirm, Input, Switch, Dropdown, Menu } from '@arco-design/web-react';
import {
    IconSunFill,
    IconMoonFill,
    IconLeft,
    IconRobotAdd,
    IconPlus,
    IconImport,
} from '@arco-design/web-react/icon';
import Link from 'next/link';
import graphState from '../hooks/use-graph-state';
import tableModel from '../hooks/table-model';
import { useTranslation } from 'react-i18next';
import SwitchLang from './switchI18n';
import { useRouter } from 'next/router';
import { Drawer } from '@arco-design/web-react';
import { useState } from 'react';
import AI from '@/components/AITool';
import { useEffect } from 'react';
import exportSQL from 'utils/export-sql';
import { useMemo } from 'react';
import { get, map } from 'lodash';
import { Alert } from '@arco-design/web-react';
import { Descriptions } from '@arco-design/web-react';
import { useRef } from 'react';
import { Tag } from '@arco-design/web-react';
import { ADD_TABLE } from '@/data/prompt/index';

/**
 * It renders a nav bar with a title, a save button, a demo button, a clear button, an export button,
 * and a name input
 * @param props - the props passed to the component
 * @returns A Nav component that takes in a title, a save button, a demo button, a clear button, an export button
 */

const COLORS = [
    'orangered',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'arcoblue',
    'purple',
    'pinkpurple',
    'magenta',
    'gray',
];

function MessageItem({ message, role, rawRender }) {
    const { t } = useTranslation('nav');
    const { sql, params, tableName } = useMemo(() => {
        const elNode = document.createElement('div');
        elNode.innerHTML = message;
        let sqlNodes = elNode.querySelectorAll('dbml');
        if (!sqlNodes.length) {
            let str = message.replace(/```dbml/g, `<dbml>`);
            str = str.replace(/```/g, `</sql>`);
            elNode.innerHTML = str;
            sqlNodes = elNode.querySelectorAll('dbml');
        }
        const tableNames = elNode.querySelectorAll('tableName');
        const varNodes = elNode.querySelectorAll('field');
        const varDescriptionNodes = elNode.querySelectorAll('description');
        return {
            sql: map(sqlNodes, node => node.outerText?.trim()),
            params: map(varNodes, (node, index) => {
                return {
                    label: node.outerText?.trim(),
                    value: get(varDescriptionNodes, index)?.outerText?.trim(),
                };
            }),
            tableName: [...tableNames].map((v, i) => (
                <Tag key={v} color={COLORS[i]} className="mr-[5px] font-bold">
                    {v.outerText}
                </Tag>
            )),
        };
    }, [message]);

    if (role === 'user') {
        return rawRender({ message, role });
    }
    console.log(params, 'params');
    return (
        <div className="mt-[20px]">
            {sql.length ? (
                <>
                    <Alert
                        style={{ marginBottom: 20 }}
                        type="success"
                        title={t(
                            'According to your business needs, a new database model has been generated for you.'
                        )}
                        content={
                            tableName ? (
                                <div>
                                    {' '}
                                    {t('Successfully added the following database tables')}:{' '}
                                    {tableName}
                                </div>
                            ) : undefined
                        }
                    />
                    <Descriptions
                        border
                        column={1}
                        title={t('Table field information')}
                        data={params}
                        style={{ marginBottom: 20 }}
                        labelStyle={{ paddingRight: 36 }}
                    />
                </>
            ) : (
                <Alert
                    type="error"
                    content={t('Generation failed, please modify the requirements and try again.')}
                />
            )}
        </div>
    );
}

export default function Nav({ setShowModal, setShowDrawer, leave = () => {}, importDBML }) {
    const {
        tableDict,
        linkDict,
        name,
        setName,
        theme,
        setTheme,
        setTableDict,
        setLinkDict,
        version,
    } = graphState.useContainer();
    const sql = exportSQL(tableDict, linkDict, 'dbml');
    const { updateGraph, addTable, applyVersion } = tableModel();
    const { t } = useTranslation('nav');
    const router = useRouter();
    const [showAIModal, setShowAIModal] = useState(false);
    const [messageList, setMessageList] = useState([]);
    const [saveLoading, setSaveLoading] = useState(false);
    useEffect(() => {
        setMessageList([
            {
                role: 'system',
                content:
                    'IMPRTANT: You are a virtual assistant powered by the gpt-3.5-turbo model, now time is 2023/5/30 16:57:14}',
            },
            {
                role: 'user',
                content: ADD_TABLE(sql),
            },
            {
                role: 'assistant',
                content: '好的，我明白了。请问你需要在当前数据库模型新增加的业务需求是什么?',
            },
            ...messageList.slice(3),
        ]);
        console.log(JSON.stringify(messageList));
    }, [sql]);

    if (version !== 'currentVersion') {
        return (
            <nav className="nav">
                <div className="nav-title">Logs Record: {name}</div>
                <Space>
                    <Button
                        loading={saveLoading}
                        onClick={async () => {
                            setSaveLoading(true);
                            await updateGraph();
                            setSaveLoading(false);
                        }}
                        type="primary"
                        status="success"
                        shape="round"
                        style={{ marginLeft: 8 }}
                        className="shadow"
                    >
                        {t('Apply Select Version')}
                    </Button>
                    <Button
                        onClick={() => applyVersion('currentVersion')}
                        shape="round"
                        style={{ marginLeft: 8 }}
                        className="shadow"
                    >
                        {t('Exit Logs View')}
                    </Button>
                </Space>
            </nav>
        );
    }

    return (
        <nav className="nav">
            <Space>
                <IconLeft
                    style={{ fontSize: 20 }}
                    onClick={() => {
                        leave(f => {
                            f && updateGraph();
                            router.push('/graphs');
                        });
                    }}
                />
                <Input
                    type="text"
                    value={name}
                    className="shadow"
                    onChange={value => setName(value)}
                    style={{ width: '240px' }}
                />
                <Button
                    size="small"
                    type="primary"
                    status="success"
                    shape="round"
                    loading={saveLoading}
                    className="shadow"
                    onClick={async () => {
                        setSaveLoading(true);
                        await updateGraph();
                        setSaveLoading(false);
                    }}
                >
                    {t('Save')}
                </Button>
            </Space>

            <Space>
                <Dropdown
                    className="shadow"
                    position="bottom"
                    droplist={
                        <Menu>
                            <Menu.Item
                                key="add"
                                className="context-menu-item"
                                onClick={() => addTable()}
                            >
                                <IconPlus /> {t('Add Table')}
                            </Menu.Item>
                            <Menu.Item
                                key="add"
                                className="context-menu-item"
                                onClick={() => setShowAIModal(true)}
                            >
                                <IconRobotAdd /> {t('AI createTable')}
                            </Menu.Item>
                            <Menu.Item
                                key="import"
                                className="context-menu-item"
                                onClick={() => setShowModal('import')}
                            >
                                <IconImport /> {t('Import Table')}
                            </Menu.Item>
                        </Menu>
                    }
                >
                    <Button size="small" type="primary" shape="round" className="shadow">
                        + {t('New Table')}
                    </Button>
                </Dropdown>
                <Popconfirm
                    title={t('Are you sure you want to delete all the tables?')}
                    okText={t('Yes')}
                    cancelText={t('No')}
                    position="br"
                    onOk={() => {
                        setTableDict({});
                        setLinkDict({});
                    }}
                >
                    <Button
                        size="small"
                        type="outline"
                        status="danger"
                        shape="round"
                        className="shadow"
                    >
                        {t('Clear')}
                    </Button>
                </Popconfirm>
                <Button
                    className="shadow"
                    size="small"
                    type="outline"
                    shape="round"
                    onClick={() => setShowModal('export')}
                >
                    {t('Export')}
                </Button>
                <Button
                    className="shadow"
                    size="small"
                    type="secondary"
                    shape="round"
                    onClick={() => setShowDrawer('logs')}
                >
                    {t('Logs')}
                </Button>
                <SwitchLang />
                <Switch
                    className="shadow"
                    checkedIcon={<IconMoonFill />}
                    uncheckedIcon={<IconSunFill className="text-orange-500 " />}
                    checked={theme === 'dark'}
                    onChange={e => setTheme(e ? 'dark' : 'light')}
                />
            </Space>
            <Drawer
                width={620}
                title={<span>{t('AI createTable')}</span>}
                visible={showAIModal}
                className="shadow"
                onCancel={() => setShowAIModal(false)}
                footer={null}
            >
                <AI
                    startView={3}
                    doneFx={message => {
                        const elNode = document.createElement('div');
                        elNode.innerHTML = message;
                        let sqlNodes = elNode.querySelectorAll('dbml');
                        const Record = {
                            tableDict,
                            linkDict,
                        };
                        setTimeout(() => {
                            if (sqlNodes[0]?.textContent) {
                                setTableDict({});
                                setLinkDict({});
                                importDBML.current(sqlNodes[0]?.textContent, undefined, () => {
                                    setTableDict(Record.tableDict);
                                    setLinkDict(Record.linkDict);
                                });
                            }
                        }, 100);
                    }}
                    messageList={messageList}
                    setMessageList={setMessageList}
                    renderMessageItem={props => <MessageItem {...props} />}
                />
            </Drawer>
        </nav>
    );
}
