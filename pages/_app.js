import '@arco-design/web-react/dist/css/arco.css';
import '../styles/globals.sass';
import '../styles/globals.css';
import '../styles/home.scss';
import '../styles/markdown/index.css';
import '../styles/markdown/index.scss';
import '../next-i18next.config.js';

import GraphContainer from '../hooks/use-graph-state';
import { ConfigProvider, ConfigContext } from '@arco-design/web-react';
import { useState } from 'react';
import { Spin } from '@arco-design/web-react';
import { useEffect } from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

function MyApp({ Component, pageProps }) {
    const [local, setLocal] = useState();
    const { i18n } = useTranslation();
    useEffect(() => {
        // import('@arco-design/web-react/es/locale/en-US').then(lang => {
        //     console.log(lang.default);
        //     setLocal(lang.default);
        // });
        // console.log(i18n.language);
        if (i18n.language === 'en') {
            import('@arco-design/web-react/es/locale/en-US').then(lang => {
                setLocal(lang.default);
            });
        } else if (i18n.language === 'zh') {
            import('@arco-design/web-react/es/locale/zh-CN').then(lang => {
                setLocal(lang.default);
            });
        } else {
            import('@arco-design/web-react/es/locale/zh-CN').then(lang => {
                setLocal(lang.default);
            });
        }
    }, [setLocal, i18n.language]);
    return (
        <GraphContainer.Provider>
            {local ? (
                <ConfigProvider locale={local}>
                    <Component {...pageProps} />
                </ConfigProvider>
            ) : (
                <div className="fixed inset-0 flex justify-center items-center">
                    <Spin dot />
                </div>
            )}
        </GraphContainer.Provider>
    );
}

export default MyApp;
