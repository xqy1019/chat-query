import getConfig from 'next/config';
import APi, { backendApi } from '.';
const {
    publicRuntimeConfig: { apiPath },
} = getConfig();

export type ExecuteSqlPrams = Record<string, any>;

export default class ExecuteQuery {
    static executeSql(config: ExecuteSqlPrams, execution: {
        content: string;
        type: string
    }[], dbID: string,) {
        return backendApi.post( '/query/querySql', {
            config,
            execution,
            dbID,
        });
    }
}
