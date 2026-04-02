class EventEmitter extends EventTarget {
    listen(eventName, callback, options) {
        const handler = (event) => callback(event.detail);
        this.addEventListener(eventName, handler, options);
        return {
            remove: () => this.removeEventListener(eventName, handler)
        };
    }
    publish(eventName, data) {
        this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
}
export const helpers = {
    eventEmitter: new EventEmitter()
};
