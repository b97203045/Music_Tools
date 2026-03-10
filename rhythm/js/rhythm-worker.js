/**
 * Web Worker for rhythm practice timing.
 * Runs setInterval in an isolated thread to avoid main-thread throttling
 * (browsers throttle timers in background tabs).
 */
let timerId = null;

self.onmessage = (e) => {
    const { command, interval } = e.data;

    switch (command) {
        case 'start':
            if (timerId !== null) clearInterval(timerId);
            timerId = setInterval(() => self.postMessage('tick'), interval || 25);
            break;

        case 'stop':
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
            }
            break;

        case 'interval':
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = setInterval(() => self.postMessage('tick'), interval || 25);
            }
            break;
    }
};
