import type { NetworkLog } from '../../types';
import { buildMarkdown } from '../../utils/buildMarkdown';

export interface ExportRequest {
  logs: NetworkLog[];
}

export interface ExportResponse {
  markdown: string;
}

/**
 * Runs off the sidepanel's main thread so building a Markdown export of a
 * large log list (each entry redacted, stringified, and possibly carrying a
 * console/storage snapshot) never blocks scrolling or filtering.
 */
addEventListener('message', (event: MessageEvent<ExportRequest>) => {
  const { logs } = event.data;
  const header = `# HawkLogger Export\n\n${logs.length} request${logs.length === 1 ? '' : 's'} - generated ${new Date().toISOString()}`;
  const sections = logs.map((log) => buildMarkdown(log));
  const response: ExportResponse = { markdown: [header, ...sections].join('\n\n---\n\n') };
  postMessage(response);
});
