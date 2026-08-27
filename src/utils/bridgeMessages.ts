/**
 * window.postMessage type tags used to bridge between the MAIN-world
 * injected script and the ISOLATED-world content script. Shared here so
 * both bundles (built separately, see package.json) agree on the wire
 * format.
 */
export const HAWKLOGGER_SETTINGS_MESSAGE = '__HAWKLOGGER_SETTINGS__';
