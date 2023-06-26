import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
    List,
    Button,
    Empty,
    Space,
    Avatar,
    Popconfirm,
    Notification,
    Divider,
    Tag,
} from '@arco-design/web-react';
import {
    IconEdit,
    IconDelete,
    IconNav,
    IconCalendarClock,
    IconCopy,
    IconThunderbolt,
    IconFolderAdd,
    IconPlus,
} from '@arco-design/web-react/icon';
import { useState, useEffect } from 'react';
import { addGraph, delGraph, getAllGraphs } from '../../data/db';
import ListNav from '../../components/list_nav';
import northwindTraders from '../../data/example/northwind_traders.json';
import blog from '../../data/example/blog.json';
import spaceX from '../../data/example/spacex.json';
import { redirect } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { map } from 'lodash';
import { Dropdown } from '@arco-design/web-react';
import { Menu } from '@arco-design/web-react';
import { get } from 'lodash';
import { useRef } from 'react';

const ImportModal = dynamic(() => import('../../components/import_modal'), { ssr: false });

/**
 * It fetches all the graphs from the database and displays them in a list
 * @returns Home component
 */
export default function Home() {
    const router = useRouter();
    const [graphs, setGraphs] = useState([]);
    const [showModal, setShowModal] = useState('');
    const [importType, setImportType] = useState('');
    const { t } = useTranslation('translations');
    const { t: st } = useTranslation('modelList');
    const { t: nt } = useTranslation('ListNav');

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

    const deleteGraph = async id => {
        await delGraph(id);
        setGraphs(state => state.filter(item => item.id !== id));
    };

    const handlerImportGraph = async ({ tableDict, linkDict, name }) => {
        const id = await addGraph({
            tableDict,
            linkDict,
            name: name || `Untitled graph ${graphs.length}`,
        });
        router.push(`/graphs/${id}`);
    };

    const handlerAddGraph = async name => {
        const id = await addGraph({ name: `Untitled graph ${graphs.length}` });
        router.push(`/graphs/${id}`);
    };

    const handlerAddExample = async () => {
        try {
            await Promise.all(
                [northwindTraders, blog, spaceX].map(({ id, ...item }) => addGraph(item, id))
            );
        } catch (error) {
            Notification.error({
                title: st('Example already exists or name conflicts'),
            });
            return;
        }
        setGraphs(state => [northwindTraders, blog, spaceX, ...state]);
        Notification.success({
            title: st('Sample data generated success.'),
        });
    };
    function importGraph(type) {
        setShowModal('import');
        setImportType(type);
    }
    // 传递导入方法
    const importDBML = useRef();

    return (
        <>
            <Head>
                <title>CHAT QUERY</title>
                <meta name="description" content={t('Data Query Based on Data Model and AI')} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <ListNav
                addGraph={() => handlerAddGraph()}
                importGraph={importGraph}
                addExample={() => handlerAddExample()}
                handlerImportGraph={handlerImportGraph} // AI
                importDBML={importDBML}
            />
            <div className="graph-container">
                {graphs && graphs.length ? (
                    <List
                        className="graph-list shadow-lg graphs-list"
                        size="large"
                        header={t('Data Model')}
                        dataSource={graphs}
                        render={(item, index) => (
                            <List.Item
                                className="flex"
                                key={item.id}
                                extra={
                                    <Space className="flex items-center h-full">
                                        <Link
                                            href={`/actions/queriesList?id=${item.id}&name=${item.name}`}
                                        >
                                            <Button
                                                type="primary"
                                                icon={<IconThunderbolt />}
                                                shape="round"
                                                className="shadow"
                                                onClick={() => {}}
                                            >
                                                {st('Queries List')}
                                            </Button>
                                        </Link>
                                        <Link href={`/graphs/${item.id}`}>
                                            <Button
                                                type="secondary"
                                                icon={<IconEdit />}
                                                shape="round"
                                                className="shadow"
                                            >
                                                {st('Edit Model')}
                                            </Button>
                                        </Link>
                                        <Popconfirm
                                            title={st('Are you sure to delete this graph?')}
                                            okText={t('Yes')}
                                            cancelText={t('No')}
                                            position="br"
                                            onOk={() => deleteGraph(item.id)}
                                        >
                                            <Button
                                                type="primary"
                                                status="danger"
                                                shape="round"
                                                className="shadow"
                                                icon={<IconDelete />}
                                            >
                                                {st('Delete')}
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                }
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar shape="square">
                                            {get(item, 'name[0]', 'unknow')}
                                        </Avatar>
                                    }
                                    title={item.name}
                                    description={
                                        <Space style={{ marginTop: 4 }}>
                                            <Tag color="arcoblue" icon={<IconNav />}>
                                                {Object.keys(item.tableDict || {}).length} tables
                                            </Tag>
                                            <Tag color="green" icon={<IconCopy />}>
                                                {t('createdAt')}
                                                {new Date(item.createdAt).toLocaleString()}
                                            </Tag>
                                            <Tag color="gold" icon={<IconCalendarClock />}>
                                                {t('updatedAt')}
                                                {new Date(item.updatedAt).toLocaleString()}
                                            </Tag>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="tc">
                        <Empty style={{ marginBottom: 16 }} />
                        <Dropdown
                            key={0}
                            trigger={'hover'}
                            droplist={
                                <Menu className="w-[200px]">
                                    <Menu.Item key="3" onClick={() => importGraph(3)}>
                                        {nt('Import Database')}
                                    </Menu.Item>
                                    <Menu.Item key="0" onClick={() => importGraph(1)}>
                                        {nt('Import DBML')}
                                    </Menu.Item>
                                    <Menu.Item key="2" onClick={() => importGraph(2)}>
                                        {nt('Import DDL')}
                                    </Menu.Item>
                                    <Menu.Item key="1" onClick={() => handlerAddGraph()}>
                                        {nt('Create from Blank')}
                                    </Menu.Item>
                                </Menu>
                            }
                        >
                            <Button size="large" type="primary" onClick={() => handlerAddGraph()}>
                                <IconPlus /> {st('Create a new ERD model')}
                            </Button>
                        </Dropdown>
                        <Divider orientation="center">{t('OR')}</Divider>
                        <Button size="large" type="outline" onClick={() => handlerAddExample()}>
                            {st('Create an ERD model from an example')}
                        </Button>
                    </div>
                )}
            </div>
            <ImportModal
                showModal={showModal}
                onCloseModal={() => setShowModal('')}
                cb={args => handlerImportGraph(args)}
                type={importType}
                importDBML={importDBML}
            />
        </>
    );
}
