import AI from '@/components/AITool';
import Head from 'next/head';
import ListNav from '../../components/list_nav';
import {
    Avatar,
    Button,
    Checkbox,
    Dropdown,
    Empty,
    Form,
    Grid,
    Input,
    Layout,
    List,
    Menu,
    Message,
    Modal,
    Notification,
    Space,
    Table,
    Tabs,
    Typography,
    Select,
} from '@arco-design/web-react';
import { memo, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { getAllGraphs } from '@/data/db';
import {
    IconClose,
    IconCloseCircleFill,
    IconDelete,
    IconEdit,
    IconLeft,
    IconPlayArrow,
    IconPlayArrowFill,
    IconPlayCircle,
    IconPlus,
    IconRobotAdd,
    IconSwap,
    IconUnorderedList,
} from '@arco-design/web-react/icon';
import {
    debounce,
    each,
    filter,
    find,
    first,
    get,
    isEqual,
    map,
    omit,
    pick,
    pickBy,
    set,
    size,
    uniqueId,
    values,
} from 'lodash';
import { nanoid } from 'nanoid';
import graphState from 'hooks/use-graph-state';
import exportSQL from 'utils/export-sql';
import ExecuteQuery from '@/client/api/executeQuery';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

import { DBForm } from '@/components/import_modal';
import useSWR from 'swr';
import ConnectDb, { DBInfo } from '@/client/api/connectDb';
import { backendApi } from '@/client/api';
import { types } from 'util';
import ActionForm from './actionForm';
import { DataTable, QueriesList } from './queriesList';
import { GET_QUERY, GET_SCHEMA_INFO } from '@/data/prompt';
import Welcome from 'components/AITool/MessageItem';
import * as queryTipRaw from '@/data/prompt/query-tip';
const queryTip = map(queryTipRaw, v => {
    return {
        name: v,
        value: v,
    };
});

const Content = Layout.Content;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const style = {
    textAlign: 'center',
    marginTop: 20,
};

type Session = {
    id: string;
    name: string;
    modelId: string;
    messageList: any[];
    setMessageList: (value: any) => any;
};

function getQueryType(tagName: string) {
    switch (tagName) {
        case 'SQL':
            return 'sql';
    }
}

function AddDBForSchema({
    showDbModel,
    setShowDbModel,
    addDbCallback,
    form,
    currentModelsDb,
}: Record<string, any>) {
    const { t } = useTranslation('actions');
    return (
        <Modal
            visible={showDbModel}
            style={{
                width: '600px',
            }}
            onCancel={() => {
                setShowDbModel(false);
            }}
            onOk={addDbCallback}
        >
            <DBForm
                form={form}
                // initialValues={{}}
                slot={
                    <>
                        {showDbModel ? (
                            <FormItem
                                label={t('Connection Name')}
                                field="name"
                                initialValue={t('Connection') + (currentModelsDb.length + 1)}
                                rules={[{ type: 'boolean', required: true }]}
                            >
                                <Input />
                            </FormItem>
                        ) : null}
                        <FormItem
                            wrapperCol={{
                                span: 17,
                                offset: 5,
                            }}
                            field="create"
                            triggerPropName="checked"
                            initialValue={false}
                            rules={[{ type: 'boolean' }]}
                        >
                            <Checkbox>{t('Create a new database in the data source')}</Checkbox>
                        </FormItem>
                        <Form.Item shouldUpdate className="auto-h mb-[0]">
                            {({ create }) => {
                                return create ? (
                                    <Form.Item
                                        className="100%"
                                        label={t('Database Information')}
                                        field="client"
                                        rules={[{ required: true }]}
                                    >
                                        <Form.Item
                                            field="newDbName"
                                            rules={[{ required: true }]}
                                            className="mb-0"
                                        >
                                            <Input placeholder={t('New Database Name')} />
                                        </Form.Item>
                                    </Form.Item>
                                ) : null;
                            }}
                        </Form.Item>
                    </>
                }
            />
        </Modal>
    );
}

function DbList({
    currentModelsDb,
    setActiveDb,
    mutate,
    activeDb,
    setShowDbModel,
    setShowQueriesList,
}: any) {
    return (
        <>
            {currentModelsDb.length
                ? map(currentModelsDb, (db, index) => (
                      <Avatar
                          key={index}
                          onClick={() => setActiveDb(db.id)}
                          triggerIcon={
                              <IconDelete
                                  className="text-red-800"
                                  onClick={async () => {
                                      await ConnectDb.removeDbForSchema(db.id);
                                      mutate();
                                  }}
                              />
                          }
                          className={`${
                              db.id === activeDb
                                  ? 'bg-[rgb(var(--primary-6))] shadow-slate-600'
                                  : 'bg-slate-400 shadow-[rgba(0,0,0,0.5)] hover:shadow-[var(--pc)] hover:bg-[rgb(var(--primary-4))]'
                          } mb-[10px] shadow `}
                      >
                          {db.name}
                      </Avatar>
                  ))
                : null}
            <Button
                className="cursor-pointer shadow shadow-[var(--pc)]"
                onClick={() => setShowDbModel(true)}
                shape="circle"
                size="large"
            >
                <IconPlus className="text-[rgb(var(--primary-6))]" />
            </Button>
            <div className="absolute bottom-[20px]">
                <IconUnorderedList
                    onClick={() => setShowQueriesList(true)}
                    fontSize={25}
                    className="hover:text-[rgb(var(--primary-6))] text-[rgb(var(--primary-3))] cursor-pointer"
                />
            </div>
        </>
    );
}

const EmptyPage = memo(
    ({ graphs, createModel }: { graphs: Record<string, any>; createModel: () => any }) => {
        const { t } = useTranslation('actions');
        return (
            <div className="flex justify-center items-center flex-col pt-[150px] w-full">
                <Empty />
                <div>
                    {/* <Dropdown
                        droplist={
                            <Menu>
                                {map(graphs, ({ name, id }) => {
                                    return (
                                        <Menu.Item key={id} onClick={() => createModel(id, name)}>
                                            {name}
                                        </Menu.Item>
                                    );
                                })}
                            </Menu>
                        }
                    > */}
                    <Button
                        type="primary"
                        icon={<IconPlus />}
                        onClick={createModel}
                        className="shadow"
                    >
                        {t('Select model to create')}
                    </Button>
                    {/* </Dropdown> */}
                </div>
            </div>
        );
    },
    isEqual
);
EmptyPage.displayName = 'EmptyPage';

const MessageItemHOC = ({ setShowQueriesList, activeDb, currentModels, activeModelKey }: any) => {
    const component = memo(
        ({ message, role, rawRender }: any) => {
            const { t } = useTranslation('actions');
            const [form] = Form.useForm();
            if (role === 'user') {
                return rawRender({ message, role });
            }
            const { sql, params, types, queryName, queryDescription } = useMemo<{
                sql: any;
                types: any;
                params: Record<string, any>;
                queryName: any;
                queryDescription: any;
            }>(() => {
                const elNode = document.createElement('div');
                elNode.innerHTML = message;
                let sqlNodes = elNode.querySelectorAll('sql');
                if (!sqlNodes.length) {
                    let str = message.replace(/```sql/g, `<sql>`);
                    str = str.replace(/```/g, `</sql>`);
                    elNode.innerHTML = str;
                    sqlNodes = elNode.querySelectorAll('sql');
                }
                const varNodes = elNode.querySelectorAll('var');
                const varDescriptionNodes = elNode.querySelectorAll('varDescription');
                const queryName = elNode.querySelector('queryName');
                const queryDescription = elNode.querySelector('queryDescription');

                return {
                    sql: map(sqlNodes, node => node.textContent?.trim()),
                    types: map(sqlNodes, node => getQueryType(node.tagName)),
                    params: pickBy(
                        Object.fromEntries(
                            map(varNodes, (node, index) => [
                                node.textContent?.trim(),
                                varDescriptionNodes[index]?.textContent?.trim() || '',
                            ])
                        ),
                        (_, key) => {
                            return /^\$(.*)\$$/.test(key);
                        }
                    ),
                    queryName: queryName?.textContent?.trim(),
                    queryDescription: queryDescription?.textContent?.trim(),
                };
            }, [message]);
            const [preViewData, setPreViewData] = useState([]);
            const [rawSqlMode, switchrawSqlMode] = useState(false);
            const [loading, setLoading] = useState(false);
            const [modal, contextHolder] = Modal.useModal();
            const [formInstance] = Form.useForm();
            return (
                <div
                    className={`flex gap-3 p-4 box-border shadow mx-[5px] rounded transition-colors mt-[20px] font-hm ${
                        role === 'user'
                            ? 'bg-[rgb(var(--primary-6))] text-white'
                            : 'bg-[var(--white-bg)] text-[#333]'
                    }`}
                >
                    <Form style={{ width: '100%' }} autoComplete="off" form={form}>
                        <div className="py-[10px] pb-[30px] text-[20px] justify-between flex">
                            {size(sql) ? (
                                <>
                                    {t('A query has been generated for you')}
                                    <span>
                                        <IconSwap
                                            onClick={() => {
                                                switchrawSqlMode(!rawSqlMode);
                                            }}
                                        />
                                    </span>
                                </>
                            ) : (
                                t('Failed to generate query')
                            )}
                        </div>
                        {rawSqlMode || !size(sql) ? (
                            <pre
                                className="break-before-all mb-[20px]"
                                style={{
                                    whiteSpace: 'break-spaces',
                                }}
                            >
                                {message}
                            </pre>
                        ) : (
                            map(params, (val, key) => {
                                console.log(val, key);
                                return (
                                    <FormItem
                                        label={key}
                                        key={key}
                                        field={key}
                                        className={'form-item'}
                                    >
                                        <Input placeholder={`${t('input')}${val}`} />
                                    </FormItem>
                                );
                            })
                        )}
                        {size(sql) ? (
                            [
                                <FormItem key="1">
                                    <Button
                                        type="primary"
                                        loading={loading}
                                        shape="round"
                                        onClick={() => {
                                            // ConnectDb.addQuery({
                                            //     schemaId: '',
                                            //     DbID: '',
                                            //     name: '',
                                            //     content: undefined,
                                            // });
                                            (modal as any).info({
                                                icon: null,
                                                title: t('Query Information'),
                                                content: (
                                                    <ActionForm
                                                        form={formInstance}
                                                        initialValues={{ name: queryName }}
                                                    />
                                                ),
                                                onOk: async () => {
                                                    const modelId =
                                                        currentModels[activeModelKey || '']
                                                            ?.modelId;
                                                    await ConnectDb.addQuery({
                                                        ...(formInstance.getFields() as {
                                                            name: string;
                                                        }),
                                                        schemaId: modelId || '',
                                                        DbID: activeDb || '',
                                                        content: {
                                                            params: params || {},
                                                            executions: sql.map(
                                                                (sql: string, index: number) => {
                                                                    return {
                                                                        content: sql,
                                                                        type: types[index],
                                                                    };
                                                                }
                                                            ),
                                                            info: {
                                                                queryDescription,
                                                                queryName,
                                                            },
                                                        },
                                                    });
                                                    setShowQueriesList(true);
                                                },
                                            });
                                        }}
                                        icon={<IconPlus />}
                                    >
                                        {t('Add into queries List')}
                                    </Button>
                                    <Button
                                        className="mx-[20px] font-bold"
                                        type="outline"
                                        loading={loading}
                                        shape="round"
                                        onClick={() => {
                                            // executeSql;
                                            setLoading(true);
                                            ExecuteQuery.executeSql(
                                                form.getFields(),
                                                sql.map((sql: string, index: number) => {
                                                    return {
                                                        content: sql,
                                                        type: types[index],
                                                    };
                                                }),
                                                activeDb
                                            ).then(data => {
                                                setPreViewData(get(data, 'data.data'));
                                                Notification.info({
                                                    closable: false,
                                                    title: t('Execution succeeded'),
                                                    content: '',
                                                });
                                                setLoading(false);
                                            });
                                        }}
                                        icon={<IconPlayArrowFill />}
                                    >
                                        {t('run')}
                                    </Button>
                                    {contextHolder}
                                </FormItem>,
                                <div className="w-full" key="preViewData">
                                    <DataTable data={preViewData} />
                                </div>,
                            ]
                        ) : (
                            <Empty
                                description={t('Error in query')}
                                icon={<IconCloseCircleFill className="text-red-500" />}
                            />
                        )}
                    </Form>
                </div>
            );
        },
        (p: Object, n: Object) => {
            return isEqual(pick(n, ['message', 'role']), pick(p, ['message', 'role']));
        }
    );
    component.displayName = 'MessageItem';
    return component;
};

export default function Actions(props) {
    const [graphs, setGraphs] = useState([]);
    const params = useSearchParams();
    const defaultId = params.get('id');
    const defaultName = params.get('name');
    const { t } = useTranslation('actions');
    const { t: ct } = useTranslation();
    const [currentModels, setCurrentModels] = useState<
        Record<
            string,
            {
                id: string;
                name: string;
                modelId: string;
                sessions: Record<string, Session>;
            }
        >
    >({});
    const [currentSessions, setCurrentSessions] = useState<Session[]>([]);
    const [activeModelKey, setActiveModelKey] = useState<string>();
    const [activeSessionKey, setActiveSessionKey] = useState<string>();
    const [showDbModel, setShowDbModel] = useState(false);
    const [activeDb, setActiveDb] = useState('');
    const [showQueriesList, setShowQueriesList] = useState(false);

    const { tableDict, linkDict, setQueryId, currentGraph } = graphState.useContainer();
    const sql = exportSQL(tableDict, linkDict, 'dbml');

    const [_, dispath] = useReducer((state: number) => {
        setCurrentSessions([...currentSessions]);
        return state++;
    }, 0);

    const createModel = useCallback(
        (id: string, name: string) => {
            const sessionId = nanoid();
            const modelId = nanoid();
            const nameId = uniqueId(name + t('_QUERY_'));

            const session = {
                id: sessionId,
                name: nameId + '_1',
                modelId: id,
                messageList: [],
                setMessageList: (messageList: any) => {
                    session.messageList = messageList;
                    dispath();
                },
            };
            const newModels = {
                ...currentModels,
                [modelId]: {
                    id: modelId,
                    name: nameId,
                    modelId: id,
                    sessions: {
                        [sessionId]: session,
                    },
                },
            };
            setCurrentModels(newModels);
            setCurrentSessions([session]);
            setActiveSessionKey(sessionId);

            //设置模型
            setActiveModelKey(modelId);
            setQueryId(id);
        },
        [
            currentModels,
            setCurrentModels,
            setCurrentSessions,
            setActiveSessionKey,
            setCurrentSessions,
            setQueryId,
        ]
    );

    const { data, mutate } = useSWR(defaultId, () => {
        if (defaultId) {
            return ConnectDb.getAllForSchema(defaultId);
        }
    });

    const SchemaDescription = get(currentGraph, 'description');
    const [form] = Form.useForm();
    const currentModelsDb = useMemo(() => get(data, 'data', []), [data]);
    const MessageItem = useMemo(() => {
        return MessageItemHOC({ setShowQueriesList, activeDb, currentModels, activeModelKey });
    }, [setShowQueriesList, activeDb, currentModels, activeModelKey]);

    useEffect(() => {
        if (defaultId && defaultName) {
            const models = JSON.parse(localStorage.getItem(defaultId + '_' + 'models') || '{}');
            if (size(models)) {
                each(models, ({ sessions }) => {
                    each(sessions, session => {
                        session.setMessageList = (messageList: any) => {
                            session.messageList = messageList;
                            dispath();
                        };
                    });
                });
                setCurrentModels(models);
                const model = first(values(models));
                setCurrentSessions(values(model.sessions));
                setActiveSessionKey(get(first(values(model.sessions)), 'id'));
                setActiveModelKey(model.id);
            } else {
                createModel(defaultId, defaultName);
            }
        }
    }, [defaultId]);

    useEffect(() => {
        const initGraphs = async () => {
            try {
                const data = await getAllGraphs();
                if (data && data.length) {
                    data.sort((a, b) => b.createdAt - a.createdAt);
                    setGraphs(data);
                }
            } catch (e) {
                console.log(e);
            }
        };
        initGraphs();
    }, []);

    const saveSessions = useCallback(
        debounce(() => {
            if (defaultId) {
                localStorage.setItem(defaultId + '_' + 'models', JSON.stringify(currentModels));
            }
        }, 500),
        [defaultId, currentModels]
    );

    useEffect(() => {
        saveSessions();
    }, [currentSessions, saveSessions]);

    useEffect(() => {
        const session = find(currentSessions, { id: activeSessionKey });
        if (!get(session, 'messageList.length') && sql) {
            session?.setMessageList([
                {
                    role: 'system',
                    content:
                        'IMPRTANT: You are a virtual assistant powered by the gpt-3.5-turbo model, now time is 2023/5/30 16:57:14}',
                },
                {
                    role: 'user',
                    content: GET_QUERY(sql),
                },
                {
                    role: 'assistant',
                    content: '好的，我明白了。请问你的业务是什么?',
                },
            ]);
        }
    }, [activeSessionKey, sql, currentSessions]);

    useEffect(() => {
        if (data && !get(data, 'data', []).length) {
            setShowDbModel(true);
        }
    }, [data]);

    useEffect(() => {
        setActiveDb(get(currentModelsDb, '[0].id'));
    }, [currentModelsDb]);

    const addDbCallback = async () => {
        const config = form.getFields();
        await ConnectDb.addDbForSchema({
            name: config.name || '',
            schemaId: defaultId || '',
            config: config as DBInfo,
        });
        mutate();
        setShowDbModel(false);
    };

    return (
        <>
            <Head>
                <title>CHAT QUERY</title>
                <meta name="description" content={ct('Data Query Based on Data Model and AI')} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                <ListNav customNode={<span></span>} />
                <Link
                    href={`/actions/queriesList?id=${params.get('id')}&name=${params.get('name')}`}
                    passHref
                    className="fixed left-[20px] bottom-[20px] z-[99]"
                >
                    <Button shape="circle" type="secondary" className="shadow-lg">
                        <IconLeft style={{ fontSize: 15 }} />
                    </Button>
                </Link>
                <Layout>
                    <div
                        className={'shadow-none pt-[70px] h-full flex items-start '}
                        style={{ width: 'calc(100%)' }}
                    >
                        {Object.keys(currentModels).length ? (
                            <Tabs
                                tabPosition="left"
                                editable
                                onDeleteTab={key => {
                                    Modal.confirm({
                                        title: t('Confirm deletion') + ' ?',
                                        content: null,
                                        okButtonProps: {
                                            status: 'danger',
                                        },
                                        onOk: () => {
                                            // currentModels;
                                            const newModels = omit(currentModels, key);
                                            setCurrentModels(newModels);
                                            if (key === activeModelKey) {
                                                const activeModel = first(values(newModels)) as {
                                                    sessions: any;
                                                    id: string;
                                                };
                                                const { sessions } = activeModel;
                                                setCurrentSessions(values(sessions));
                                                setActiveSessionKey(values(sessions)[0].id);
                                                setActiveModelKey(activeModel.id);
                                            }
                                        },
                                    });
                                }}
                                className="w-full"
                                onChange={key => {
                                    const { sessions } = currentModels[key];
                                    setCurrentSessions(values(sessions));
                                    setActiveSessionKey(values(sessions)[0].id);
                                    setActiveModelKey(key);
                                }}
                                activeTab={activeModelKey}
                                addButton={
                                    <Button
                                        type="primary"
                                        icon={<IconPlus />}
                                        size="mini"
                                        onClick={() =>
                                            defaultId && createModel(defaultId, defaultName || '')
                                        }
                                    />
                                }
                                style={{
                                    height: 'calc(100vh - 80px)',
                                }}
                                destroyOnHide={false}
                            >
                                {map(currentModels, modle => {
                                    return (
                                        <TabPane
                                            key={modle.id}
                                            title={modle.name}
                                            destroyOnHide={false}
                                        >
                                            <Tabs
                                                // editable
                                                className="sessions—box"
                                                type="card-gutter"
                                                onChange={key => {
                                                    setActiveSessionKey(key);
                                                }}
                                                activeTab={activeSessionKey}
                                                addButton={
                                                    <IconRobotAdd
                                                        fontSize={20}
                                                        className="text-[rgb(var(--primary-6))] hover:text-[rgb(var(--primary-4))]"
                                                    />
                                                }
                                            >
                                                {map(currentSessions, session => {
                                                    return (
                                                        <TabPane
                                                            key={session.id}
                                                            title={session.name}
                                                        >
                                                            <Content>
                                                                <AI
                                                                    quickTip={queryTip}
                                                                    welcome={
                                                                        <>
                                                                            <div className="my-4 flex rounded-sm  text-[15px] font-bold text-[rgb(var(--primary-6))]">
                                                                                {t(
                                                                                    'Model Description'
                                                                                )}
                                                                                ：
                                                                            </div>
                                                                            {SchemaDescription ? (
                                                                                <Welcome
                                                                                    message={
                                                                                        SchemaDescription
                                                                                    }
                                                                                    role={
                                                                                        'assistant'
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <Empty
                                                                                    description={
                                                                                        <span className="text-[var(--pc)] ml-[12px]">
                                                                                            {t(
                                                                                                'In AI Analysis Model'
                                                                                            ) +
                                                                                                ' ...'}
                                                                                        </span>
                                                                                    }
                                                                                />
                                                                            )}
                                                                            <Welcome
                                                                                message={t(
                                                                                    'Hello! I an CHAT QUERY ai, please describe your business!'
                                                                                )}
                                                                                role={'assistant'}
                                                                            />
                                                                        </>
                                                                    }
                                                                    startView={3}
                                                                    key={session.id}
                                                                    messageList={
                                                                        session.messageList
                                                                    }
                                                                    setMessageList={
                                                                        session.setMessageList
                                                                    }
                                                                    renderMessageItem={MessageItem}
                                                                />
                                                            </Content>
                                                        </TabPane>
                                                    );
                                                })}
                                            </Tabs>
                                        </TabPane>
                                    );
                                })}
                            </Tabs>
                        ) : (
                            <EmptyPage
                                graphs={graphs}
                                createModel={() =>
                                    defaultId && createModel(defaultId, defaultName || '')
                                }
                            />
                        )}
                        <div className="flex w-[70px] flex-wrap items-start content-start justify-center">
                            <DbList
                                {...{
                                    currentModelsDb,
                                    setActiveDb,
                                    mutate,
                                    activeDb,
                                    setShowDbModel,
                                    setShowQueriesList,
                                }}
                            />
                            <QueriesList
                                visible={showQueriesList}
                                setVisible={setShowQueriesList}
                                modelId={currentModels[activeModelKey || '']?.modelId}
                            />
                            <AddDBForSchema
                                showDbModel={showDbModel}
                                setShowDbModel={setShowDbModel}
                                addDbCallback={addDbCallback}
                                form={form}
                                currentModelsDb={currentModelsDb}
                            />
                        </div>
                    </div>
                </Layout>
            </div>
        </>
    );
}
