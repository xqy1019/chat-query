import { Button, Card, Spin } from '@arco-design/web-react';
import { IconCode, IconEye, IconRefresh, IconSend, IconSwap } from '@arco-design/web-react/icon';
import React, { ReactElement, memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    LiveEditor,
    LiveError,
    LivePreview,
    LiveProvider,
    useLiveContext,
} from 'react-live-runner';
import * as styledComponents from 'styled-components';
import * as echarts from 'echarts';
import ReactDOM from 'react-dom';
import ReactECharts from 'echarts-for-react';
import AI from '@/components/AITool';
import useSWRMutation from 'swr/mutation';
import getView from '@/client/api/getView';
import { nanoid } from 'nanoid';
import { get } from 'lodash';
import { useTranslation } from 'react-i18next';

function Error() {
    const { error } = useLiveContext();
    console.log(error, 'error');
    return <code>{error}</code>;
}

export function ChatView({
    defaultNode,
    props,
}: {
    defaultNode?: ReactElement;
    props: Record<string, any>;
}) {
    const [showCode, setShowCode] = useState(true);
    const reqRef = useRef(nanoid());
    const [showTable, setShowTable] = useState(false);
    const { trigger, data, isMutating } = useSWRMutation(reqRef.current, (_, { arg: { need } }) => {
        return getView.getViewComponent({
            props,
            need,
        });
    });

    const SendButton = useCallback(
        ({ inputRef }: { inputRef: any }) => {
            return (
                <Button
                    shape="circle"
                    icon={data ? <IconRefresh /> : <IconSend />}
                    size="mini"
                    type="primary"
                    loading={isMutating}
                    onClick={async () => {
                        await trigger({ need: inputRef.current.dom.value });
                        setShowTable(false);
                    }}
                />
            );
        },
        [isMutating, trigger, setShowTable]
    );

    const example = get(data, 'data.code');
    const { t } = useTranslation('chatView');

    const Live = useMemo(() => {
        let node;
        try {
            node = !showCode ? (
                <LiveEditor className="overflow-auto  min-h-[350px]" />
            ) : (
                <LivePreview />
            );
        } catch (err) {
            node = <LiveEditor className="overflow-auto  min-h-[350px]" />;
        }

        return (
            <LiveProvider
                code={example}
                scope={{
                    data: props,
                    import: {
                        react: React,
                        'react-dom': ReactDOM,
                        'styled-components': styledComponents,
                        'echarts-for-react': ReactECharts,
                        echarts: {
                            default: echarts,
                            echarts: echarts,
                            ...echarts,
                        },
                    },
                }}
            >
                {node}
                <Error />
            </LiveProvider>
        );
    }, [example, props, showCode]);

    return (
        <div>
            <div className="flex justify-between items-center mb-[20px]">
                <AI
                    simpleMode="input"
                    startView={3}
                    inputProps={{
                        style: { width: 400 },
                        height: 36,
                        className: 'overflow-hidden simple-mode-border',
                        prefix: <span className="text-[var(--pc)]">{t('component display')}</span>,
                        autoFocus: false,
                    }}
                    SendButton={SendButton}
                    messageList={[]}
                    setMessageList={function (value: any[]) {
                        return false;
                    }}
                />
                {data && (
                    <Button shape="circle" onClick={() => setShowTable(!showTable)}>
                        <IconSwap />
                    </Button>
                )}
            </div>
            <Spin loading={isMutating} block className="my-[20px]">
                {example && !showTable ? (
                    <div>
                        <div className="text-[20px] absolute text-orange-200 z-[99] right-[20px]">
                            {showCode ? (
                                <IconCode onClick={() => setShowCode(false)} />
                            ) : (
                                <IconEye onClick={() => setShowCode(true)} />
                            )}
                        </div>
                        <div className="overflow-hidden">{Live}</div>
                    </div>
                ) : (
                    defaultNode || null
                )}
            </Spin>
        </div>
    );
}

export default function View() {
    return null;
}
