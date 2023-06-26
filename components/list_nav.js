import { Space, Button, Switch, Notification } from '@arco-design/web-react';
import { IconSunFill, IconMoonFill, IconThunderbolt, IconRobot } from '@arco-design/web-react/icon';
import Link from 'next/link';
import graphState from '../hooks/use-graph-state';
import { Dropdown } from '@arco-design/web-react';
import { Menu } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import SwitchLang from './switchI18n';
import AI from './AITool';
import { useMemo, useState } from 'react';
import { map, uniqueId } from 'lodash';
import { useRouter } from 'next/router';
import { ADD_SCHEMA } from '@/data/prompt';

/**
 * It renders a nav bar with a link to the home page, a button to add a new graph, and a dropdown menu
 * with a list of import options
 * @param props - the props passed to the component
 * @returns List Nav component
 */

export default function ListNav({
    importGraph,
    addGraph,
    customNode,
    addExample,
    importDBML,
    handlerImportGraph,
}) {
    const { theme, setTheme } = graphState.useContainer();
    const { t } = useTranslation('ListNav');
    const router = useRouter();

    const custom = customNode
        ? customNode
        : [
              <Dropdown
                  key={0}
                  trigger={'hover'}
                  droplist={
                      <Menu>
                          <Menu.Item key="3" onClick={() => importGraph(3)}>
                              {t('Import Database')}
                          </Menu.Item>
                          <Menu.Item key="0" onClick={() => importGraph(1)}>
                              {t('Import DBML')}
                          </Menu.Item>
                          <Menu.Item key="2" onClick={() => importGraph(2)}>
                              {t('Import DDL')}
                          </Menu.Item>
                          <Menu.Item key="1" onClick={() => setSimpleModeVisible(true)}>
                              {/* <span className=" text-lime-600 mr-[10px]">
                                  <IconRobot />
                              </span> */}
                              {t('Created by AI')}
                          </Menu.Item>
                          <Menu.Item key="1" onClick={() => addGraph()}>
                              {t('Create from Blank')}
                          </Menu.Item>
                      </Menu>
                  }
              >
                  <Button type="primary" shape="round" className="shadow">
                      + {t('New Model')}
                  </Button>
              </Dropdown>,
              <Button
                  key={1}
                  size="small"
                  shape="round"
                  className="shadow"
                  onClick={() => addExample()}
              >
                  {t('Import Example')}
              </Button>,
          ];
    const [messageList, setMessageList] = useState([
        {
            role: 'system',
            content:
                'IMPRTANT: You are a virtual assistant powered by the gpt-3.5-turbo model, now time is 2023/5/30 16:57:14}',
        },
        {
            role: 'user',
            content: ADD_SCHEMA(),
        },
        {
            role: 'assistant',
            content: '好的，我明白了。请问你的业务是什么?',
        },
    ]);
    const [simpleModeVisible, setSimpleModeVisible] = useState(false);

    return (
        <div className="nav">
            <AI
                startView={3}
                messageList={messageList}
                setMessageList={() => false}
                simpleMode
                simpleModeVisible={simpleModeVisible}
                setSimpleModeVisible={setSimpleModeVisible}
                doneFx={message => {
                    const elNode = document.createElement('div');
                    elNode.innerHTML = message;
                    let sqlNodes = elNode.querySelectorAll('dbml');
                    let modelName = elNode.querySelector('modelName');
                    if (!sqlNodes.length) {
                        let str = message.replace(/```dbml/g, `<dbml>`);
                        str = str.replace(/```/g, `</sql>`);
                        elNode.innerHTML = str;
                        sqlNodes = elNode.querySelectorAll('dbml');
                    }
                    if (!sqlNodes[0]?.textContent) {
                        Notification.error({
                            title: t(
                                'AI was unable to understand your input, please further clarify your input.'
                            ),
                        });
                    }
                    importDBML.current(sqlNodes[0]?.textContent, ({ tableDict, linkDict }) => {
                        handlerImportGraph({
                            tableDict,
                            linkDict,
                            name: `${modelName.outerText}`,
                        });
                    });
                }}
                // renderMessageItem={props => <MessageItem {...props} />}
            />
            <div>
                <Link href="/graphs" passHref>
                    <strong className="text-[22px] app-text mr-[10px]">CHAT QUERY</strong>
                    <span className="text-[var(--pc)]">
                        {t('Data Query Based on Data Model and AI')}
                    </span>
                </Link>
            </div>
            <Space>
                {custom}
                <SwitchLang />
                <Switch
                    className="shadow"
                    checkedIcon={<IconMoonFill />}
                    uncheckedIcon={<IconSunFill className="text-orange-500 " />}
                    checked={theme === 'dark'}
                    onChange={e => setTheme(e ? 'dark' : 'light')}
                />
            </Space>
        </div>
    );
}
