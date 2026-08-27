import { useState } from 'react';
import type { NetworkLog } from '../../types';
import { buildMarkdown } from '../../utils/buildMarkdown';
import { formatBody } from '../../utils/parseBody';
import { redact, redactHeaders, redactStorageSnapshot } from '../../utils/redact';
import { ConsoleLogList } from './ConsoleLogList';

interface LogDetailProps {
  log: NetworkLog;
}

export function LogDetail({ log }: LogDetailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const markdown = buildMarkdown(log);
    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(console.error);
  };

  const redactedReqHeaders = redactHeaders(log.reqHeaders);
  const redactedResHeaders = redactHeaders(log.resHeaders);
  const redactedReqBody = log.reqBody != null ? redact(log.reqBody) : null;
  const redactedResBody = log.resBody != null ? redact(log.resBody) : null;
  const storageSnapshot = log.storageSnapshot != null ? redactStorageSnapshot(log.storageSnapshot) : null;

  return (
    <div className="border-t border-[#2a2a2a] bg-[#111] px-3 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[10px] text-[#555]">{log.url}</span>
        <button
          onClick={handleCopy}
          className={
            copied
              ? 'shrink-0 rounded bg-[#10B981] px-3 py-1 text-xs font-medium text-[#0f0f0f] transition-all'
              : 'shrink-0 rounded bg-[#5B4FCF] px-3 py-1 text-xs font-medium text-white transition-all hover:bg-[#6B5FDF]'
          }
        >
          {copied ? 'Copied' : 'Copy as MD'}
        </button>
      </div>

      {log.error && (
        <div className="mb-3 rounded border border-[#E24B4A] bg-[#2a0f0f] px-3 py-2 font-mono text-[11px] text-[#E24B4A]">
          {log.error}
        </div>
      )}

      <Section title="REQUEST">
        <DetailBlock label="Headers" data={redactedReqHeaders} />
        {redactedReqBody !== null && <DetailBlock label="Body" data={redactedReqBody} />}
      </Section>

      <Section title="RESPONSE">
        <DetailBlock label="Headers" data={redactedResHeaders} />
        {redactedResBody !== null && <DetailBlock label="Body" data={redactedResBody} />}
        {redactedResBody === null && (
          <p className="font-mono text-[11px] text-[#555]">(empty body)</p>
        )}
      </Section>

      {log.consoleLogs != null && log.consoleLogs.length > 0 && (
        <Section title="CONSOLE LOGS">
          <ConsoleLogList entries={log.consoleLogs} />
        </Section>
      )}

      {storageSnapshot != null && (
        <Section title="FAILURE SNAPSHOT">
          {storageSnapshot.cookies != null && Object.keys(storageSnapshot.cookies).length > 0 && (
            <DetailBlock label="Cookies" data={storageSnapshot.cookies} />
          )}
          {storageSnapshot.localStorage != null && Object.keys(storageSnapshot.localStorage).length > 0 && (
            <DetailBlock label="Local Storage" data={storageSnapshot.localStorage} />
          )}
          {storageSnapshot.sessionStorage != null &&
            Object.keys(storageSnapshot.sessionStorage).length > 0 && (
              <DetailBlock label="Session Storage" data={storageSnapshot.sessionStorage} />
            )}
          {storageSnapshot.truncated && (
            <p className="text-[10px] text-[#F59E0B]">Snapshot truncated - some entries omitted.</p>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[9px] font-bold tracking-widest text-[#555]">{title}</div>
      {children}
    </div>
  );
}

function DetailBlock({ label, data }: { label: string; data: unknown }) {
  return (
    <div className="mb-2">
      <div className="mb-0.5 text-[9px] text-[#444]">{label}</div>
      <pre className="max-h-48 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all rounded border border-[#1e1e1e] bg-[#0a0a0a] p-2 font-mono text-[11px] text-[#aaa]">
        {formatBody(data)}
      </pre>
    </div>
  );
}
