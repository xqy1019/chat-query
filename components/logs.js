import { useState, useEffect } from 'react';
import { Drawer, Notification, Popconfirm, Space } from '@arco-design/web-react';

import { delLogs, getLogs } from '../data/db';
import graphState from '../hooks/use-graph-state';
import tableModel from '../hooks/table-model';
import { useTranslation } from 'react-i18next';

export default function LogsDrawer({ showDrawer, onCloseDrawer }) {
    const { id, version } = graphState.useContainer();
    const { applyVersion } = tableModel();
    const [logs, setLogs] = useState(undefined);
    const { t } = useTranslation();

    const viewLogs = async () => {
        const records = await getLogs(id);
        setLogs(records);
    };

    useEffect(() => {
        if (showDrawer === 'logs') {
            viewLogs();
        }
    }, [showDrawer]);

    const deleteLogs = (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        delLogs(id);
        setLogs(state => state.filter(item => item.id !== id));
        Notification.success({
            title: 'Delete logs record success',
        });
    };

    return (
        <Drawer
            width={320}
            title="Logs Record"
            visible={showDrawer === 'logs'}
            autoFocus={false}
            footer={null}
            mask={false}
            onCancel={() => onCloseDrawer()}
            style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)' }}
        >
            <Space
                align="start"
                className={`custom-radio-card ${
                    version === 'currentVersion' ? 'custom-radio-card-checked' : ''
                }`}
                onClick={() => applyVersion('currentVersion')}
            >
                <div className="custom-radio-card-dot"></div>
                <div>
                    <div className="custom-radio-card-title">Current Version</div>
                </div>
            </Space>

            {logs
                ? logs.map(item => (
                      <Space
                          key={item.updatedAt}
                          align="start"
                          className={`custom-radio-card ${
                              version === item.updatedAt ? 'custom-radio-card-checked' : ''
                          }`}
                          onClick={() => applyVersion(item)}
                      >
                          <div className="custom-radio-card-dot"></div>
                          <div>
                              <div className="custom-radio-card-title  overflow-hidden text-ellipsis whitespace-nowrap w-[200px]">
                                  Version {item.id}
                              </div>
                              <div className="custom-radio-card-secondary">
                                  Auto save at {new Date(item.updatedAt).toLocaleString()}
                              </div>
                          </div>
                          <Popconfirm
                              position="br"
                              title={t('Are you sure you want to delete this logs record?')}
                              okText={t('Yes')}
                              cancelText={t('No')}
                              onOk={e => deleteLogs(e, item.id)}
                              onCancel={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                              }}
                          >
                              <a
                                  className="delete-btn text-red-500 hover:text-red-800"
                                  onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                  }}
                              >
                                  [{t('Delete')}]
                              </a>
                          </Popconfirm>
                      </Space>
                  ))
                : null}
        </Drawer>
    );
}
