const gpt35 = {
    name: 'gpt-3.5-turbo',
    temperature: 0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
};

const gpt4 = {
    name: 'gpt-4-0613',
    temperature: 0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
};

export const models = [gpt35, gpt4];

export const getModel = (name: string) => {
    for (const model of models) {
        if (model.name === name) {
            return model;
        }
    }
    return gpt35;
};
