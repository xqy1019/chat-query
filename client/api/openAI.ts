import getConfig from 'next/config';
import { backendApi } from '.';
import { getModel } from '@/utils/gpt';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';

export interface View {
    type: 'schema' | 'table';
    name?: string;
}

const model = getModel('gpt35');

export function prettyObject(msg: any) {
    const obj = msg;
    if (typeof msg !== 'string') {
        msg = JSON.stringify(msg, null, '  ');
    }
    if (msg === '{}') {
        return obj.toString();
    }
    if (msg.startsWith('```json')) {
        return msg;
    }
    return ['```json', msg, '```'].join('\n');
}

type message = {
    role: string;
    content: string;
};

export default class OpenAI {
    static async request(
        messages: message[],
        onFinish: (responseText: string) => any,
        onUpdate: (responseText: string, delta: string) => any,
        onError: (e: Error) => any,
        stream: boolean = true
    ) {
        const requestPayload = {
            messages: messages,
            model: model.name,
            temperature: model.temperature,
            frequency_penalty: model.frequency_penalty,
            presence_penalty: model.presence_penalty,
            stream,
        };
        const controller = new AbortController();
        const chatPayload = {
            method: 'POST',
            body: JSON.stringify(requestPayload),
            signal: controller.signal,
            headers: {
                'cache-control': 'no-cache',
                'Content-Type': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                Accept: 'text/event-stream',
            },
        };
        const requestTimeoutId = setTimeout(() => controller.abort(), 1000 * 120);
        const chatPath = '/openai/v1/chat/completions';
        if (stream) {
            let responseText = '';
            let finished = false;
            const finish = () => {
                if (!finished) {
                    onFinish(responseText);
                    finished = true;
                }
            };
            controller.signal.onabort = finish;
            fetchEventSource(chatPath, {
                ...chatPayload,
                async onopen(res) {
                    clearTimeout(requestTimeoutId);
                    const contentType = res.headers.get('content-type');
                    console.log('[OpenAI] request response content type: ', contentType);

                    if (contentType?.startsWith('text/plain')) {
                        responseText = await res.clone().text();
                        return finish();
                    }

                    if (
                        !res.ok ||
                        !res.headers.get('content-type')?.startsWith(EventStreamContentType) ||
                        res.status !== 200
                    ) {
                        const responseTexts = [responseText];
                        let extraInfo = await res.clone().text();
                        try {
                            const resJson = await res.clone().json();
                            extraInfo = prettyObject(resJson);
                        } catch {}

                        if (extraInfo) {
                            responseTexts.push(extraInfo);
                        }

                        responseText = responseTexts.join('\n\n');

                        return finish();
                    }
                },
                onmessage(msg) {
                    if (msg.data === '[DONE]' || finished) {
                        return finish();
                    }
                    const text = msg.data;
                    try {
                        const json = JSON.parse(text);
                        const delta = json.choices[0].delta.content;
                        if (delta) {
                            responseText += delta;
                            onUpdate?.(responseText, delta);
                        }
                    } catch (e) {
                        console.error('[Request] parse error', text, msg);
                    }
                },
                onclose() {
                    finish();
                },
                onerror(e) {
                    onError?.(e);
                    throw e;
                },
                openWhenHidden: true,
            });
        } else {
            const res = await fetch(chatPath, chatPayload);
            clearTimeout(requestTimeoutId);
            const resJson = await res.json();
            const message = resJson.choices?.at(0)?.message?.content ?? '';
            console.log(message);
            onFinish(message);
        }
    }
}
