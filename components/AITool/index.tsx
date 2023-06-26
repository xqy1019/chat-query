import {
    Button,
    Input,
    Comment,
    Avatar,
    Skeleton,
    Form,
    Modal,
    Spin,
    Notification,
    AutoComplete,
} from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import MessageItem from './MessageItem';

import { debounce, filter, get, map } from 'lodash';
import React, {
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';
import { IconRecord, IconRobot, IconSend, IconSwap, IconVoice } from '@arco-design/web-react/icon';
import { getModel } from '@/utils/gpt';

// import useSpeechToText from 'react-hook-speech-to-text';
let useSpeechToText: any;
// (async () => {
//     if (process.browser) useSpeechToText = (await import('react-hook-speech-to-text')).default;
// })();
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const getQuestion = (question: string) => `${question}`;
const model = getModel('gpt35');

type AIProps = {
    context: any;
    messageList: any[];
    setMessageList: (value: any[]) => any;
    startView: number;
    renderMessageItem: any;
    doneFx: (message: string) => any;
    simpleMode?: string | true;
    simpleModeVisible?: boolean;
    setSimpleModeVisible?: () => any;
    welcome: ReactElement | string;
    quickTip?: string[] | { value: string; name: string; [key: string]: any }[];
    searchFlag: RegExp;
    inputProps?: Record<string, any>;
    SendButton: ({ inputRef }: { inputRef: any }) => JSX.Element;
};

export function AIWrapper({
    context,
    messageList,
    setMessageList,
    startView = 0,
    renderMessageItem,
    doneFx,
    simpleMode,
    simpleModeVisible = false,
    setSimpleModeVisible = () => {},
    welcome = '',
    quickTip = [],
    searchFlag = /^\//,
    inputProps = {},
    SendButton,
}: AIProps) {
    const input = useRef<HTMLInputElement>();
    const panelRef = useRef<HTMLInputElement>();

    const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [_, refresh] = useReducer(state => state++, 0);
    const scrollContainer = useRef();
    const message = useRef([]);
    const working = useRef(false);
    const [Niche, setNiche] = useState('you');
    const [tinking, setTinking] = useState(false);

    const handleButtonClickSuccess = useEffect(() => {
        if (!currentAssistantMessage || loading) {
            return;
        }
        setMessageList([
            ...messageList,

            {
                role: 'assistant',
                content: currentAssistantMessage,
            },
        ]);
        setCurrentAssistantMessage('');
        // return clearContext;
    }, [currentAssistantMessage, loading]);

    const handleButtonClick = useCallback(
        (message?: string, callBack?: (m: string) => void) => {
            const inputRef = input.current?.dom;
            const inputValue = message || inputRef.value;
            if (!inputValue) {
                return;
            }
            setLoading(true);
            // @ts-ignore
            inputRef.value = '';
            setMessageList([
                ...messageList,
                {
                    role: 'user',
                    content: inputValue,
                },
            ]);

            const toView = debounce(() => {
                scrollContainer &&
                    scrollContainer?.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end',
                    });
            }, 50);
            toView();
            fetch('/openai/v1/chat/completions', {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({
                    messages: [
                        ...messageList,
                        {
                            role: 'user',
                            content: inputValue,
                        },
                    ],
                    model: model.name,
                    temperature: model.temperature,
                    frequency_penalty: model.frequency_penalty,
                    presence_penalty: model.presence_penalty,
                    stream: true,
                }),
                method: 'POST',
            }).then(async response => {
                if (!response.ok) {
                    // throw new Error(response.statusText);
                    Notification.error({
                        title: 'No Response',
                        content: undefined,
                    });
                    // setLoading(false);
                }
                // response.text().then((text) => {
                //   setCurrentAssistantMessage(text);
                // });
                const data = response.body;
                if (!data) {
                    Notification.error({
                        title: 'No data',
                        content: undefined,
                    });
                    // setLoading(false);
                }
                const reader = data.getReader();
                const decoder = new TextDecoder('utf-8');
                let done = false;

                let currentAssistantMessageStr = currentAssistantMessage;
                while (!done) {
                    const content = await reader.read();
                    const { done: readerDone, value } = content;

                    if (value) {
                        const char = decoder.decode(value);
                        if (char === '\n' && currentAssistantMessageStr.endsWith('\n')) {
                            continue;
                        }
                        const codeBlocks = char.trim().split(`

`);
                        for (let i = 0; i < codeBlocks.length - 1; i++) {
                            currentAssistantMessageStr += get(
                                JSON.parse(codeBlocks[i].replace(/^data:/g, '').trim()),
                                'choices[0].delta.content',
                                ''
                            );
                            setCurrentAssistantMessage(currentAssistantMessageStr);
                        }
                        // if (char) {
                        //     currentAssistantMessageStr += char;
                        //     setCurrentAssistantMessage(currentAssistantMessageStr);
                        // }
                    }
                    done = readerDone;
                }
                setTinking(true);
                setTimeout(() => {
                    setLoading(false);
                    setTinking(false);
                }, 2000);
                callBack && callBack(currentAssistantMessageStr);
                doneFx && doneFx(currentAssistantMessageStr);
                console.log(currentAssistantMessageStr, 'currentAssistantMessageStr');
                setTimeout(toView, 100);
            });
        },
        [
            loading,
            messageList,
            currentAssistantMessage,
            input,
            handleButtonClickSuccess,
            scrollContainer,
        ]
    );

    const clear = () => {
        // clearContext().then(() => {
        const inputRef = input.current.dom;
        inputRef.value = '';
        setMessageList(messageList.slice(0, startView));
        setCurrentAssistantMessage('');
        // });
    };
    const [visible, setVisible] = React.useState(false);

    const user = {};

    const userIcon = user?.photoId ? (
        `/api/v1/assets/${user?.photoId}`
    ) : (
        <Avatar
            size={32}
            className="shadow-lg m-[1px] bg-gradient-to-tr from-orange-300  to-[var(--pc)]"
        >
            {Niche}
        </Avatar>
    );

    useEffect(() => {
        context && context({ clear });
    }, [context]);
    const RenderMessageItem = renderMessageItem || MessageItem;

    const { t } = useTranslation('actions');
    const animaeString = t(
        !quickTip.length
            ? 'Please input your question'
            : 'Starting with "/", retrieve frequently asked questions'
    );
    const [placeholder, setPlaceholder] = useState('');
    const [isSearching, setSearching] = useState<string | false>(false);

    const quickTipData = useMemo(() => {
        const el = input.current?.dom;
        if (isSearching && el) {
            console.log(
                filter(quickTip, ({ value }: { value: string }) => {
                    if (el) {
                        return value.indexOf(isSearching.replace(searchFlag, '').trim()) !== -1;
                    }
                })
            );
            return filter(quickTip, ({ value }: { value: string }) => {
                if (el) {
                    return value.indexOf(isSearching.replace(searchFlag, '').trim()) !== -1;
                }
            });
        }

        return [];
    }, [isSearching, quickTip, input]);

    let timer = useRef<any>();
    useEffect(() => {
        timer.current && clearTimeout(timer.current);
        if (simpleModeVisible) {
            let f = 1;
            let perStr = '';
            const start = () => {
                if (perStr.length === 0) {
                    f = 1;
                } else if (perStr === animaeString) {
                    f = -1;
                }
                perStr = animaeString.slice(0, perStr.length + f);
                setPlaceholder(perStr);
                timer.current = setTimeout(() => {
                    start();
                }, 300);
            };
            start();
        }
        return () => clearTimeout(timer.current);
    }, [timer, simpleModeVisible, animaeString]);
    const { error, interimResult, isRecording, results, startSpeechToText, stopSpeechToText } =
        useSpeechToText({
            continuous: true,
            useLegacyResults: false,
            speechRecognitionProperties: {
                interimResults: true, // Allows for displaying real-time speech results
                continuous: true,
            },
        });

    const [beforeRecordValue, setBeforeRecordValue] = useState('');
    const [recordValue, setRecordValue] = useState('');

    useEffect(() => {
        if (!isRecording) {
            const el = input.current?.dom;
            if (el) el.value = recordValue || '';
        }
    }, [isRecording, recordValue]);

    useEffect(() => {
        if (interimResult) {
            const el = input.current?.dom;
            if (el) el.value = beforeRecordValue + (interimResult || '');
        }
    }, [interimResult, beforeRecordValue]);

    const inputValue = input.current?.dom.value || '';

    const inputNode = (
        <Input
            ref={input}
            placeholder={simpleModeVisible ? placeholder + '│' : animaeString}
            allowClear={!isRecording}
            style={{ width: 650 }}
            height={56}
            className="overflow-hidden  shadow-md simple-mode  shadow-cyan-500/30"
            autoFocus
            onPressEnter={() => handleButtonClick()}
            value={inputValue}
            onChange={value => {
                const el = input.current?.dom;
                if (el) {
                    el.value = value;
                }
                setRecordValue(value);
            }}
            onClear={() => {
                const el = input.current?.dom;
                if (el) {
                    el.value = '';
                }
                setRecordValue('');
                setBeforeRecordValue('');
            }}
            suffix={
                <>
                    <Button
                        shape="circle"
                        icon={isRecording ? <IconRecord className="animate-ping" /> : <IconVoice />}
                        type="text"
                        className="mx-[10px] text-[15px]"
                        size="mini"
                        onClick={() => {
                            if (isRecording) {
                                setRecordValue(input.current?.dom.value || '');
                                stopSpeechToText();
                            } else {
                                setBeforeRecordValue(input.current?.dom.value || '');
                                startSpeechToText();
                            }
                        }}
                    />
                    {SendButton ? (
                        <SendButton inputRef={input} />
                    ) : (
                        <Button
                            disabled={loading || isRecording}
                            shape="circle"
                            icon={<IconSend />}
                            size="mini"
                            type="primary"
                            onClick={() => handleButtonClick()}
                        />
                    )}
                </>
            }
            {...inputProps}
        />
    );

    if (simpleMode) {
        if (simpleMode === 'input') {
            return inputNode;
        }
        return simpleModeVisible ? (
            <Modal
                footer={null}
                title={null}
                visible={simpleModeVisible}
                closeIcon={null}
                maskClosable
                // onOk={() => setVisible(false)}
                onCancel={() => setSimpleModeVisible(false)}
                maskStyle={{
                    background: 'rgb(94 171 165 / 0.1)',
                    backdropFilter: ' blur(4px) hue-rotate(90deg) opacity(0.5)',
                    // backdropFilter: ' hue-rotate(90deg)',
                }}
                wrapClassName="!flex justify-center items-center"
                autoFocus={true}
                modalRender={() => {
                    return !loading ? (
                        <div className="translate-y-[200px]">{inputNode}</div>
                    ) : (
                        <Spin dot />
                    );
                }}
            />
        ) : null;
    }

    return (
        <div className="w-full p-[15px] rounded">
            <div
                className="overflow-y-auto overflow-x-hidden mr-[-10px] pr-[10px] pb-[10px]"
                style={{
                    height: 'calc(100vh - 257px)',
                }}
            >
                {
                    <Comment
                        align="right"
                        author={t('assistant')}
                        avatar={
                            <IconRobot
                                style={{ fontSize: '32px', color: 'rgb(var(--primary-6))' }}
                            />
                        }
                        content={
                            welcome ? (
                                welcome
                            ) : (
                                <MessageItem
                                    message={t(
                                        'Hello! I an CHAT QUERY ai, please describe your business!'
                                    )}
                                    role={'assistant'}
                                />
                            )
                        }
                        key="message"
                    />
                }
                {map(messageList.slice(startView), (message, index) => (
                    <Comment
                        align="right"
                        author={message.role === 'user' ? Niche : t('assistant')}
                        avatar={
                            message.role === 'user' ? (
                                userIcon
                            ) : (
                                <IconRobot
                                    style={{ fontSize: '32px', color: 'rgb(var(--primary-6))' }}
                                />
                            )
                        }
                        content={
                            <RenderMessageItem
                                message={message.content}
                                role={message.role}
                                rawRender={MessageItem}
                            />
                        }
                        key={index}
                    />
                ))}
                {loading && (
                    <Comment
                        align="right"
                        author={t('assistant')}
                        avatar={
                            <IconRobot
                                style={{ fontSize: '32px', color: 'rgb(var(--primary-6))' }}
                            />
                        }
                        content={
                            !currentAssistantMessage ? (
                                <div className="my-[20px]">
                                    <Skeleton
                                        animation
                                        text={{
                                            rows: 5,
                                            width: ['100%', '100%', '100%', '100%', 400],
                                        }}
                                    />
                                </div>
                            ) : (
                                // <div>
                                //     {
                                //         <RenderMessageItem
                                //             message={currentAssistantMessage}
                                //             role="assistant"
                                //         />
                                //     }
                                // </div>
                                <div className="my-[20px]">
                                    <div
                                        className={`flex gap-3 p-4 box-border  shadow mx-[5px] rounded transition-colors mt-[20px] font-hm ${'bg-[var(--white-bg)] text-[#333]'}`}
                                    >
                                        <Form style={{ width: '100%' }} autoComplete="off">
                                            <div className="py-[10px] pb-[30px] text-[20px] justify-between flex">
                                                {t('A query has been generated for you')}
                                                <span>
                                                    <IconSwap />
                                                </span>
                                            </div>
                                            <pre
                                                className="break-before-all"
                                                style={{
                                                    whiteSpace: 'break-spaces',
                                                }}
                                            >
                                                {currentAssistantMessage}
                                            </pre>
                                        </Form>
                                    </div>
                                </div>
                            )
                        }
                    />
                )}
                <div ref={scrollContainer} />
            </div>
            {loading ? (
                <div className="animate-bounce">
                    <div className="h-12 my-4 flex items-center justify-center rounded-sm  text-[30px] font-bold gradient-text">
                        {!tinking
                            ? `${t('Analyzing requirements')}...`
                            : `${t('Creating query')}...`}
                    </div>
                </div>
            ) : (
                <Comment
                    className="items-stretch !mt-[5px] pt-[15px] mx-[-15px] px-[15px] shadow-t"
                    actions={[
                        <Button
                            key="0"
                            onClick={clear}
                            type="secondary"
                            className="shadow rounded"
                            disabled={loading || isRecording}
                        >
                            {t('reset')}
                        </Button>,
                        <Button
                            className="shadow rounded"
                            disabled={loading || isRecording}
                            key="1"
                            onClick={() => handleButtonClick()}
                            type="primary"
                        >
                            {t('send')}
                        </Button>,
                        <Button
                            key="2"
                            onClick={() => {
                                if (isRecording) {
                                    setRecordValue(input.current?.dom.value || '');
                                    stopSpeechToText();
                                } else {
                                    setBeforeRecordValue(input.current?.dom.value || '');
                                    startSpeechToText();
                                }
                            }}
                            type="secondary"
                            shape="circle"
                        >
                            {isRecording ? (
                                <IconRecord className="animate-ping text-[var(--pc)]" />
                            ) : (
                                <IconVoice className="text-[var(--pc)]" />
                            )}
                        </Button>,
                    ]}
                    align="right"
                    avatar={userIcon}
                    content={
                        <div>
                            <AutoComplete
                                data={quickTipData}
                                triggerElement={<Input.TextArea autoComplete="off" id="input" />}
                                autoFocus
                                disabled={loading}
                                placeholder={animaeString}
                                ref={input}
                                value={inputValue}
                                onChange={value => {
                                    setRecordValue(value);
                                }}
                                onPressEnter={e => {
                                    if (
                                        e.key === 'Enter' &&
                                        !e?.nativeEvent.isComposing &&
                                        !isSearching
                                    ) {
                                        console.log(e.ctrlKey);
                                        if (e.ctrlKey) {
                                            const el = input.current?.dom;
                                            if (el) {
                                                el.value = `${input.current?.dom?.value}\n`;
                                            }
                                        } else {
                                            handleButtonClick();
                                        }
                                    }
                                }}
                                filterOption={false}
                                onSearch={value => {
                                    if (searchFlag.test(value)) {
                                        setSearching(value);
                                    } else {
                                        setSearching(false);
                                    }
                                }}
                                triggerProps={{
                                    position: 'top',
                                    popupAlign: {
                                        top: 16,
                                    },
                                    className: 'w-full',
                                    // popupVisible: true,
                                }}
                                onSelect={(value: string) => {
                                    const el = input.current?.dom;
                                    if (el) {
                                        el.value = value;
                                    }
                                    setSearching(false);
                                    requestAnimationFrame(() => {
                                        input.current?.focus();
                                    });
                                }}
                            />
                        </div>
                    }
                />
            )}
        </div>
    );
}

export default function Ai(props: AIProps) {
    const [_, refresh] = useReducer(state => state++, 0);
    useEffect(() => {
        (async () => {
            if (window && !useSpeechToText) {
                useSpeechToText = (await import('react-hook-speech-to-text')).default;
                refresh();
            }
        })();
    }, []);
    return useSpeechToText ? <AIWrapper {...props} /> : null;
}
