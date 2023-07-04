import Head from 'next/head';
import useSWR from 'swr';
import getSchema from '@/client/api/getSchema';
import { get } from 'lodash';
import { List, Avatar, Layout, Typography } from '@arco-design/web-react';
import '@arco-design/web-react/dist/css/arco.css';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import Link from 'next/link';
import { useTranslation, Trans } from 'react-i18next';

function Home() {
    const { t } = useTranslation();
    return (
        <>
            <Head>
                <title>CHAT QUERY</title>
                <meta
                    name="description"
                    content={t('Data Query Based on Data Model and AI') as string}
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="home bg-scroll">
                <Layout className="main">
                    <Layout>
                        <div className="container">
                            <h1 className="bg-gradient-to-r from-orange-500  bg-lime-400 bg-clip-text text-transparent">
                                <svg
                                    className="text-stroke"
                                    viewBox="0 0 500 100"
                                    width="80%"
                                    height="100%"
                                >
                                    <defs>
                                        <linearGradient
                                            id="linear-gradient"
                                            cx="50%"
                                            cy="50%"
                                            r="50%"
                                            fx="50%"
                                            fy="50%"
                                        >
                                            <stop
                                                offset="0%"
                                                style={{
                                                    stopColor: 'rgba(249, 115, 22,.6)',
                                                }}
                                            />
                                            <stop
                                                offset="100%"
                                                style={{
                                                    stopColor: 'rgb(163 230 53)',
                                                }}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="linear-gradient1"
                                            cx="50%"
                                            cy="50%"
                                            r="50%"
                                            fx="50%"
                                            fy="50%"
                                        >
                                            <stop
                                                offset="0%"
                                                style={{
                                                    stopColor: 'rgba(163,230,53,0.8)',
                                                }}
                                            />
                                            <stop
                                                offset="100%"
                                                style={{
                                                    stopColor: 'rgba(249, 115, 22,.6)',
                                                }}
                                            />
                                        </linearGradient>
                                        <radialGradient
                                            id="linear-gradient3"
                                            cx="50%"
                                            cy="50%"
                                            r="50%"
                                            fx="50%"
                                            fy="50%"
                                        >
                                            <stop
                                                offset="0%"
                                                style={{
                                                    stopColor: 'rgb(163 230 53)',
                                                }}
                                            />
                                            <stop
                                                offset="40%"
                                                style={{
                                                    stopColor: 'rgba(249, 115, 22,.6)',
                                                }}
                                            />
                                            <stop
                                                offset="80%"
                                                style={{
                                                    stopColor: 'rgb(163 230 53)',
                                                }}
                                            />
                                            <stop
                                                offset="100%"
                                                style={{
                                                    stopColor: 'rgba(249, 115, 22,.6)',
                                                }}
                                            />
                                        </radialGradient>
                                    </defs>
                                    <text className="text" x="40" y="60">
                                        {t('WELCOME CHAT QUERY')}
                                    </text>
                                </svg>
                                <span className="gradient-text-animation bg-clip-text text-transparent text-[45px]">
                                    🎉
                                </span>
                            </h1>

                            <Link
                                href={{
                                    pathname: '/graphs',
                                }}
                            >
                                <div
                                    className="box px-4 py-2 font-semibold text-sm bg-gradient-to-r from-orange-300  bg-lime-300 hover:bg-orange-300  hover:from-lime-300 ease-in-out duration-150 flex items-center justify-center m-auto mt-6  underline decoration-transparent rounded-[10px] cursor-pointer shadow  shadow-orange-100  hover:rounded-2xl text-[var(--pc)] opacity-80 ring ring-transparent hover:ring-orange-400 hover:ring-[4px] ring-inset hover:text-[rgba(255,255,255)] text-[16px] "
                                    style={{
                                        transition: 'all 0.8s',
                                    }}
                                >
                                    {t('GET STRAT')}
                                </div>
                            </Link>
                        </div>
                    </Layout>
                </Layout>
            </main>
        </>
    );
}

export default function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Home />
        </DndProvider>
    );
}
