import React from 'react';
import MarkdownIt from 'markdown-it';
import mdHighlight from 'markdown-it-highlightjs';
// import 'katex/dist/katex.min.css';
import doMarkdownit from '@digitalocean/do-markdownit';
import Prism from '@digitalocean/do-markdownit/vendor/prismjs';
import prismTools from '@digitalocean/do-markdownit/vendor/prismjs/plugins/toolbar/prism-toolbar';
import prismCopyToClipboard from '@digitalocean/do-markdownit/vendor/prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';

import { debounce } from 'lodash';
// import style manually

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface Props {
    role: ChatMessage['role'];
    message: string;
}

// Finish!
const addPlugins = debounce(() => {
    prismTools(Prism);
    prismCopyToClipboard(Prism);
    Prism.highlightAll();
}, 50);

export const htmlString = (message: string | (() => string)) => {
    const md = MarkdownIt()
        .use(mdHighlight)
        .use(doMarkdownit, {
            fence_environment: {
                allowedEnvironments: '*',
            },
            fence_classes: {
                allowedClasses: false,
            },
            callout: {
                allowedClasses: ['note', 'warning', 'info', 'draft'],
            },
        });
    addPlugins();

    if (typeof message === 'function') {
        return md.render(message());
    } else if (typeof message === 'string') {
        return md.render(message);
    }
    return '';
};

export function codeWrapper(type: string, code: string) {
    return '``` ' + type + '\n' + code + '\n' + '```';
}

export default function MessageItem({ message, role }: Props) {
    // role === 'user';
    return (
        <div
            className={`flex gap-3 p-4 box-border mx-[5px] shadow rounded transition-colors mt-[20px] font-hm ${
                role === 'user'
                    ? 'bg-[rgb(var(--primary-6))] text-white shadow-[var(--pc)]'
                    : 'bg-[var(--white-bg)] text-[#333]'
            }`}
        >
            <div
                className="message prose text-slate break-words overflow-hidden"
                dangerouslySetInnerHTML={{
                    __html: htmlString(message),
                }}
            />
        </div>
    );
}
