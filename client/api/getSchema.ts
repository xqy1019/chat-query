import getConfig from 'next/config';
import type { NextApiRequest, NextApiResponse } from 'next';
import { table } from 'console';
import APi from '.';
const {
    publicRuntimeConfig: { apiPath },
    publicRuntimeConfig,
} = getConfig();

export interface schemaParams {
    type: 'schema' | 'table';
    name?: string;
}

export default class getSchema {
    static getTableList(config: schemaParams) {
        return APi.post(apiPath + 'getSchema', config);
    }
}
