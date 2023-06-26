/* Creating a database called graphDB and creating a table called graphs. */
import { Notification } from '@arco-design/web-react';
import { diffJson } from 'diff';
import i18n from 'i18next';
import { backendApi } from '@/client/api';
import { get, omit } from 'lodash';

function getViewGraphs(v) {
    return {
        ...get(v, 'graph', {}),
        ...omit(v, 'graph'),
    };
}

export const getAllGraphs = async () => {
    const { data } = await backendApi.get('/schema/all');
    const graphs = data.map(v => {
        return getViewGraphs(v);
    });
    return graphs;
};

export const getGraph = async id => {
    const { data } = await backendApi.get(`/schema/${id}`);
    return getViewGraphs(data);
};

export const saveGraph = async ({ id, name, tableDict, linkDict, box }) => {
    const { t } = i18n;
    try {
        const data = await getGraph(id);

        const logJson = {
            tableDict: data.tableDict,
            linkDict: data.linkDict,
            name: data.name,
        };

        if (diffJson({ tableDict, linkDict, name }, logJson).length > 1) {
            await backendApi.put(`/schema/${id}`, {
                name: name,
                graph: {
                    tableDict,
                    linkDict,
                    box,
                    name,
                },
            });
        }

        Notification.success({
            title: t('Save success'),
        });
    } catch (e) {
        Notification.error({
            title: t('Save failed'),
        });
    }
};

export const delGraph = async id => {
    return await backendApi.delete(`/schema/${id}`);
};

export const addGraph = async (graph = {}, id = null) => {
    const { data } = await backendApi.post('/schema/create', {
        name: graph.name,
        graph: {
            ...graph,
            box: {
                x: 0,
                y: 0,
                w: global.innerWidth,
                h: global.innerHeight,
                clientW: global.innerWidth,
                clientH: global.innerHeight,
            },
        },
    });
    return getViewGraphs(data).id;
};

export const getLogs = async id => {
    const { data } = await backendApi.get(`/schema/getLogs/${id}`);
    return data.map(v => getViewGraphs(v));
};

export const delLogs = id => backendApi.delete(`/schema/getLogs/${id}`);
