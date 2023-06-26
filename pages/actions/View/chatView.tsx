import { Button, Card, Spin } from '@arco-design/web-react';
import { IconCode, IconEye, IconSend } from '@arco-design/web-react/icon';
import React, { ReactElement, memo, useCallback, useRef, useState } from 'react';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live-runner';
import * as styledComponents from 'styled-components';
import * as ReactECharts from 'echarts-for-react';
import AI from '@/components/AITool';
import useSWRMutation from 'swr/mutation';
import getView from '@/client/api/getView';
import { nanoid } from 'nanoid';
import { get } from 'lodash';

export function ChatView({
    defaultNode,
    props,
}: {
    defaultNode?: ReactElement;
    props: Record<string, any>;
}) {
    const [showCode, setShowCode] = useState(true);
    const reqRef = useRef(nanoid());
    const { trigger, data, isMutating } = useSWRMutation(reqRef.current, (_, { arg: { need } }) => {
        console.log(need);
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
                    icon={<IconSend />}
                    size="mini"
                    type="primary"
                    loading={isMutating}
                    onClick={async () => {
                        await trigger({ need: inputRef.current.dom.value });
                        // inputRef.current.dom.value = '';
                    }}
                />
            );
        },
        [isMutating, trigger]
    );

    const example = get(data, 'data.code');
    console.log(example, 'isMutating');

    return (
        <div>
            <AI
                simpleMode="input"
                startView={3}
                inputProps={{
                    style: { width: 400 },
                    height: 36,
                    className: 'overflow-hidden simple-mode-border mb-[20px]',
                    prefix: <span className="text-[var(--pc)]">组件显示</span>,
                    autoFocus: false,
                }}
                SendButton={SendButton}
            />
            <Spin loading={isMutating} block className="my-[20px]">
                {example ? (
                    <div>
                        <div className="text-[20px] absolute text-orange-200 z-[99] right-[20px]">
                            {showCode ? (
                                <IconCode onClick={() => setShowCode(false)} />
                            ) : (
                                <IconEye onClick={() => setShowCode(true)} />
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <LiveProvider
                                code={example}
                                scope={{
                                    data: props,
                                    import: {
                                        react: React,
                                        'styled-components': styledComponents,
                                        'echarts-for-react': ReactECharts,
                                    },
                                }}
                            >
                                {!showCode ? (
                                    <LiveEditor className="overflow-auto  min-h-[350px]" />
                                ) : (
                                    <LivePreview />
                                )}
                                <LiveError />
                            </LiveProvider>
                        </div>
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
