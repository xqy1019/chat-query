import getConfig from 'next/config';
import APi, { backendApi } from '.';
const {
    publicRuntimeConfig: { apiPath },
    publicRuntimeConfig,
} = getConfig();

export interface View {
    type: 'schema' | 'table';
    name?: string;
}

export default class getView {
  static getViewComponent(params: {
    props: Record<string, any>,
    need: string
  }) {
        return backendApi.post('/openAi/api/reactLive', params);
    }
}
