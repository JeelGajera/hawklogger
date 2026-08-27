import { useCallback, useEffect, useRef } from 'react';
import type { NetworkLog } from '../../types';
import type { ExportRequest, ExportResponse } from '../workers/export.worker';
import ExportWorker from '../workers/export.worker?worker';

export function useExportLogs() {
  const workerRef = useRef<Worker | null>(null);

  const getWorker = useCallback((): Worker => {
    workerRef.current ??= new ExportWorker();
    return workerRef.current;
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const exportLogs = useCallback(
    (logs: NetworkLog[]): Promise<string> => {
      return new Promise((resolve, reject) => {
        const worker = getWorker();

        const handleMessage = (event: MessageEvent<ExportResponse>) => {
          cleanup();
          resolve(event.data.markdown);
        };
        const handleError = (event: ErrorEvent) => {
          cleanup();
          reject(event.error instanceof Error ? event.error : new Error(event.message));
        };
        const cleanup = () => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
        };

        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);
        worker.postMessage({ logs } satisfies ExportRequest);
      });
    },
    [getWorker],
  );

  return { exportLogs };
}
