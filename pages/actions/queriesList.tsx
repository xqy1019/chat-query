import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    Avatar,
    Button,
    Card,
    Descriptions,
    Drawer,
    Empty,
    Form,
    Input,
    Layout,
    Link,
    Notification,
    Space,
    Spin,
    Typography,
} from '@arco-design/web-react';
import useSWR from 'swr';
import ConnectDb from '@/client/api/connectDb';
import { get, map, size } from 'lodash';
import {
    IconDelete,
    IconExpand,
    IconPlayArrowFill,
    IconThunderbolt,
} from '@arco-design/web-react/icon';
import { Table } from '@arco-design/web-react';
import Head from 'next/head';
import ListNav from '@/components/list_nav';
import { useSearchParams } from 'next/navigation';
import { codeWrapper, htmlString } from '@/components/AITool/MessageItem';
import { useTranslation } from 'react-i18next';
import getConfig from 'next/config';
import { ChatView } from './View/chatView';
const {
    publicRuntimeConfig: { backendOrigin },
} = getConfig();

const FormItem = Form.Item;

export const DataTable = ({ data: preViewDataArr, loading }: any) => {
    const { t } = useTranslation('queriesList');
    return (
        <div>
            <div className="my-[10px] text-[15px] font-bold text-[rgb(var(--primary-6))]">
                {t('Data Preview')}
            </div>
            {map(preViewDataArr, preViewData => {
                return preViewData ? (
                    map(preViewData, (data, index) => {
                        return data ? (
                            <div>
                                <div>
                                    <ChatView
                                        props={data[0]}
                                        defaultNode={
                                            <Table
                                                loading={loading}
                                                className="w-full overflow-hidden mt-[20px]"
                                                scroll={{
                                                    x: '100%',
                                                    y: 400,
                                                }}
                                                border={{
                                                    wrapper: true,
                                                    cell: true,
                                                }}
                                                columns={map(data[1], ({ name }, i) => {
                                                    return {
                                                        title: name,
                                                        dataIndex: name,
                                                        ellipsis: true,
                                                    };
                                                })}
                                                data={map(data[0], (item, index) => ({
                                                    key: index,
                                                    ...item,
                                                }))}
                                                key={index}
                                            />
                                        }
                                    />
                                </div>
                            </div>
                        ) : null;
                    })
                ) : (
                    <Empty />
                );
            })}
        </div>
    );
};

function Item({
    name,
    i,
    content,
    params,
    updatedAt,
    id,
    getListFx,
    queryDescription,
}: {
    name: string;
    i: number;
    params: Record<string, any>;
    content: {
        exections: {
            content: string;
            type: string;
        };
    };
    updatedAt: string;
    id: string;
    getListFx: () => any;
    queryDescription: string;
}) {
    const [active, setActive] = useState(false);
    const [formInstance] = Form.useForm();
    const [previewData, setPreviewData] = useState([]);
    const [isRun, setRunning] = useState(false);
    const { t } = useTranslation('queriesList');
    return (
        <Card
            className="card-with-icon-hover mb-[10px] rounded drop-shadow cursor-pointer hover:border-[rgb(var(--primary-6))] border-2"
            style={{ width: '100%' }}
            actions={[
                <Button
                    key="0"
                    loading={isRun}
                    type="primary"
                    size="mini"
                    shape="round"
                    className="font-bold"
                    icon={<IconPlayArrowFill />}
                    onClick={async () => {
                        let data;
                        try {
                            setRunning(true);
                            data = await ConnectDb.runQuery(id, formInstance.getFields());
                            setRunning(false);
                        } catch (err) {
                            Notification.error({
                                content: t('Parameter check failed'),
                            });
                        }
                        setPreviewData(get(data, 'data.data', []));
                        setActive(true);
                    }}
                >
                    {t('RUN')}
                </Button>,
                <Button
                    key="1"
                    size="mini"
                    shape="round"
                    status="danger"
                    icon={<IconDelete />}
                    onClick={async () => {
                        await ConnectDb.deleteQuery(id);
                        Notification.success({
                            content: t('Deletion succeeded'),
                            duration: 1000,
                        });
                        getListFx();
                    }}
                />,
                <Button
                    key="2"
                    size="mini"
                    shape="round"
                    status={active ? 'success' : 'default'}
                    onClick={() => setActive(!active)}
                    icon={<IconExpand />}
                />,
            ]}
        >
            <Card.Meta
                // className={`${active ? 'shadow p-[10px]' : ''}`}
                avatar={
                    <Space>
                        <Avatar size={15}>YOU</Avatar>
                        <span className="text-[12px] text-[rgb(var(--primary-6))]">
                            {new Date(updatedAt).toLocaleString()}
                        </span>
                    </Space>
                }
                description={
                    <div className="my-[10px] ">
                        <Typography.Paragraph className=" h-full !m-0 my-[5px] text-[rgb(var(--primary-6))] font-bold text-[12px] inline-block">
                            {t('Query Description')}
                        </Typography.Paragraph>
                        {queryDescription ? (
                            <div className="my-[5px] text-[12px] indent-[2em]">
                                {queryDescription}
                            </div>
                        ) : (
                            <Empty description={t('No description needed')} icon={<span></span>} />
                        )}
                        <Typography.Paragraph
                            className=" h-full !m-0 my-[5px] text-[rgb(var(--primary-6))] font-bold text-[12px] inline-block"
                            copyable={{
                                text: JSON.stringify({ params: formInstance.getFields() }),
                            }}
                        >
                            {t('Parameter Description')}
                        </Typography.Paragraph>
                        {Object.keys(params).length ? (
                            <Form style={{ width: '100%' }} autoComplete="off" form={formInstance}>
                                {map(params, (val, key) => {
                                    return (
                                        <FormItem
                                            label={key}
                                            key={key}
                                            field={key}
                                            className={'form-item'}
                                            initialValue={''}
                                        >
                                            <Input placeholder={`${val}`} />
                                        </FormItem>
                                    );
                                })}
                            </Form>
                        ) : (
                            <Empty description={t('No parameters needed')} icon={<span></span>} />
                        )}
                    </div>
                }
                title={
                    <div className=" items-center text-[rgb(var(--primary-6))] font-bold justify-start">
                        <div className="mr-[20px] mb-[10px]">{name}</div>
                        <Input
                            style={{
                                width: '100%',
                                // border: '1px solid rgb(var(--primary-6))',
                            }}
                            readOnly
                            className="shadow-lg  text-[rgb(var(--primary-6))]"
                            value={`${backendOrigin}/query/run/${id}?type=1`}
                            disabled
                            addBefore={
                                <span className="text-[#ccc] text-[14px]">
                                    {t('Request Address')}
                                </span>
                            }
                            addAfter={
                                <Typography.Paragraph
                                    className="flex items-center h-full !m-0"
                                    copyable={{
                                        text: `${backendOrigin}/query/run/${id}?type=1`,
                                    }}
                                ></Typography.Paragraph>
                            }
                        />
                    </div>
                }
            />
            {active ? (
                <div className="mt-[20px] border-t border-solid">
                    {/* mx-[-15px] px-[15px] */}

                    <Descriptions
                        border
                        size="mini"
                        title={
                            <div className="my-[10px] text-[rgb(var(--primary-6))] font-bold text-[15px]">
                                {t('Execution Details')}
                            </div>
                        }
                        column={1}
                        data={map(content, ({ type, content }) => ({
                            label: type,
                            value: (
                                <div
                                    className="message prose text-slate break-words overflow-hidden"
                                    dangerouslySetInnerHTML={{
                                        __html: htmlString(codeWrapper(type, content)),
                                    }}
                                />
                            ),
                        }))}
                        style={{ marginBottom: 20 }}
                        labelStyle={{ paddingRight: 36 }}
                    />
                    <DataTable data={previewData} loading={isRun} />
                </div>
            ) : null}
        </Card>
    );
}

export function QueriesList({
    visible,
    setVisible,
    modelId,
}: {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    modelId: string;
}) {
    const { t } = useTranslation('queriesList');
    return (
        <Drawer
            width={600}
            title={<span>{t('Queries List')}</span>}
            visible={visible}
            onOk={() => {
                setVisible(false);
            }}
            onCancel={() => {
                setVisible(false);
            }}
            footer={null}
            autoFocus={false}
        >
            <QueriesRender modelId={modelId} refresh={visible} />
        </Drawer>
    );
}

function QueriesRender({ modelId, refresh }: { modelId: string; refresh?: boolean }) {
    const { data, isLoading, mutate } = useSWR('all_query_for_Schema', () => {
        return modelId && ConnectDb.getQueries(modelId);
    });

    useEffect(() => {
        if (refresh) mutate && mutate();
    }, [refresh]);

    useEffect(() => {
        modelId && mutate && mutate();
    }, [modelId]);

    const renderData = get(data, 'data', []);
    const params = useSearchParams();
    const { t } = useTranslation('queriesList');

    return (
        <Spin loading={isLoading} className="block min-h-[500px]">
            {size(renderData) ? (
                map(renderData, ({ name, content, updatedAt, id }, index) => (
                    <Item
                        name={name}
                        i={index}
                        updatedAt={updatedAt}
                        content={get(content, 'executions', [])}
                        params={get(content, 'params', {})}
                        queryDescription={get(content, 'info.queryDescription')}
                        id={id}
                        getListFx={mutate}
                        key={index}
                    />
                ))
            ) : (
                <div className="flex justify-center items-center flex-col">
                    <Empty className="mt-[40px] m-auto" />
                    <Link
                        href={`/actions?id=${params.get('id')}&name=${params.get('name')}`}
                        className="!bg-transparent mt-[20px]"
                    >
                        <Button
                            type="primary"
                            icon={<IconThunderbolt />}
                            onClick={() => {}}
                            size="large"
                        >
                            {t('Edit Query')}
                        </Button>
                    </Link>
                </div>
            )}
        </Spin>
    );
}
export default function QueriesPage() {
    const params = useSearchParams();
    const { t } = useTranslation('queriesList');
    const { t: ct } = useTranslation();

    return (
        <>
            <Head>
                <title>CHAT QUERY</title>
                <meta name="description" content={ct('Data Query Based on Data Model and AI')} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <ListNav
                customNode={[
                    <Link
                        key="0"
                        href={`/actions?id=${params.get('id')}&name=${params.get('name')}`}
                        className="!bg-transparent"
                    >
                        <Button
                            size="small"
                            type="primary"
                            icon={<IconThunderbolt />}
                            shape="round"
                            onClick={() => {}}
                        >
                            {t('Edit Query')}
                        </Button>
                    </Link>,
                ]}
                importGraph={undefined}
                addGraph={undefined}
                addExample={undefined}
                importDBML={undefined}
                handlerImportGraph={undefined}
            />
            <Layout className="overflow-auto mt-[85px]">
                <div
                    className="w-[85%] m-auto"
                    style={{
                        height: 'calc(100vh - 120px)',
                    }}
                >
                    <QueriesRender modelId={params.get('id')} />
                </div>
            </Layout>
        </>
    );
}
