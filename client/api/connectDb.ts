import getConfig from 'next/config';
import APi, { backendApi } from '.';
const {
    publicRuntimeConfig: { apiPath },
} = getConfig();

export type DBInfo = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    client: 'mysql2';
    name?: string
};

export default class ConnectDb {
    static create(config: DBInfo) {
        return backendApi.post('query/testConnectDb', config);
    }
    static getDbDBML(config: DBInfo) {
        return backendApi.post('query/getDbDBML', config);
    }
    static addDbForSchema(params: {
        'config': DBInfo,
        'schemaId':string,
        'name':string
    }) {
        return backendApi.post('query/createDbConnect',params);
    }
    static getAllForSchema(schemaId:string) {
        return backendApi.get(`query/${schemaId}/DbConnect`);
    }
    static removeDbForSchema(DbID:string) {
        return backendApi.delete(`query/DbConnect/${DbID}`);
    }
    static addQuery(query: {
        schemaId:string,
        DbID:string,
        name:string,
        content: {
            executions:{
                content: string;
                type: string
            },
            params:Record<string,any>
            info: { queryDescription:string,queryName:string}
        }
    }) {
        return backendApi.post("query/add",query)
    }
    static deleteQuery(queryId:string) {
        return backendApi.delete(`/query/${queryId}`)
    }
    static getQueries(schemaId: string) {
        return backendApi.get(`query/${schemaId}/queries`)
    }
    static runQuery(queryId: string,params:Record<string, any>) {
        return backendApi.post(`query/run/${queryId}`,{params})
    }
}
