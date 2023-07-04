import { Button, Card, Collapse, Spin } from '@arco-design/web-react';
import { IconCode, IconEye, IconRefresh, IconSend, IconSwap } from '@arco-design/web-react/icon';
import React, {
    ReactElement,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
import { get, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
import Editor, { Monaco, useMonaco, OnMount } from '@monaco-editor/react';
import { XML } from '@/utils/getXMLContent';
import { useWorker } from '@koale/useworker';
import dynamic from 'next/dynamic';
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

const CollapseItem = Collapse.Item;

type MonacoEditor = Parameters<OnMount>[0];

function Error() {
    const { error } = useLiveContext();
    console.log(error, 'error');
    return <code>{error}</code>;
}

export function ChatView({
    defaultNode,
    props: propsRaw,
}: {
    defaultNode?: ReactElement;
    props: Record<string, any>;
}) {
    const [showCode, setShowCode] = useState(true);
    const reqRef = useRef(nanoid());
    const [showTable, setShowTable] = useState(false);
    const [props, setProps] = useState(propsRaw);

    useEffect(() => {
        setProps(propsRaw);
    }, [propsRaw]);

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

    const [editor, setEditor] = useState<MonacoEditor>();
    const monaco = useMonaco();
    const [workerFn, { status: workerStatus, kill: workerTerminate }] = useWorker(
        (data, code) => {
            return new Function('data', code)(data);
        },
        {
            autoTerminate: false,
        }
    );
    console.log(workerStatus, 'workerStatus');

    const onKeyDown = editor?.onKeyDown!;
    const KeyDownEvent = useRef<ReturnType<typeof onKeyDown>>();

    useEffect(() => {
        if (editor) {
            if (KeyDownEvent.current) {
                KeyDownEvent.current.dispose();
            }
            KeyDownEvent.current = editor.onKeyDown(function (event: any) {
                if (event.keyCode === 2 && monaco) {
                    const position = editor.getPosition();
                    const line = editor.getModel()?.getLineContent(position!.lineNumber) || '';
                    const flag = /^\/\//;
                    if (flag.test(line)) {
                        // 在当前行后面提示“生成中”占位符
                        const position = editor.getPosition()!;
                        const lineNumber = position.lineNumber;
                        const column = position.column;
                        const insertText = ' 代码生成中，请稍后...';
                        const op = {
                            range: new monaco.Range(lineNumber, column, lineNumber, column),
                            text: insertText,
                        };
                        editor.executeEdits('insertSnippet', [op]);

                        getView
                            .getViewFunction({
                                data: props,
                                need: line.replace(flag, ''),
                            })
                            .then((data: any) => {
                                const code = get(data, 'data.code');
                                const xml = new XML(code);
                                const insertText = xml.get('FunctionCode');

                                const nextLineNumber = lineNumber + 1;
                                console.log(insertText);
                                const op1 = {
                                    range: new monaco.Range(
                                        lineNumber,
                                        0,
                                        lineNumber,
                                        column + insertText.length
                                    ),
                                    text: line,
                                };
                                const op2 = {
                                    range: new monaco.Range(nextLineNumber, 1, nextLineNumber, 1),
                                    text: insertText.trim() + '\n\n',
                                };

                                editor.executeEdits('insertSnippet', [op1, op2]);
                            });
                    }
                }
            });
        }
    }, [editor, props]);

    return (
        <div>
            <div className="w-full mb-[20px]">
                <Collapse style={{ maxWidth: 1180 }}>
                    <CollapseItem
                        header="数据处理"
                        name="1"
                        extra={
                            <Button
                                onClick={async () => {
                                    const data = await workerFn(
                                        propsRaw,
                                        `${editor.getValue()};\n return handler(data);`
                                    );
                                    console.log(data);
                                    setProps(data);
                                }}
                                type="primary"
                                size="mini"
                            >
                                Run
                            </Button>
                        }
                    >
                        <Editor
                            onMount={(instance, monaco) => {
                                console.log(instance);
                                setEditor(instance);
                            }}
                            height="300px"
                            defaultLanguage="javascript"
                            defaultValue={`/**
 * @description 处理数据的函数
 * @param  record<string,any> data
 */

function handler(data){
    return data
}

`}
                        />
                    </CollapseItem>
                </Collapse>
            </div>
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
                ) : isEqual(props, propsRaw) ? (
                    defaultNode || null
                ) : (
                    <ReactJson src={props} />
                )}
            </Spin>
        </div>
    );
}

export default function View() {
    return null;
}
