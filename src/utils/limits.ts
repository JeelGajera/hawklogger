/**
 * Hard caps that bound how much data the Failure Snapshot feature can ever
 * capture. These exist so a chatty page (thousands of console calls, a huge
 * localStorage blob) cannot blow up memory, chrome.storage.session quota,
 * or sidepanel render time.
 */

export const MAX_CONSOLE_BUFFER = 300;
export const CONSOLE_BUFFER_TRIM_TO = 200;
export const MAX_CONSOLE_ATTACHED = 20;
export const MAX_CONSOLE_MESSAGE_LENGTH = 1000;

export const MAX_STORAGE_ENTRIES = 50;
export const MAX_STORAGE_VALUE_LENGTH = 2000;
