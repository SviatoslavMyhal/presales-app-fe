export const globalProperties = {};
export const VueGlobalPropertiesPlugin = {
    install: (app) => {
        for (const i in globalProperties) {
            app.config.globalProperties[i] = globalProperties[i];
        }
    }
};
