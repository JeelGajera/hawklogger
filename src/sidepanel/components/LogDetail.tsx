import { useState } from 'react';
import type { NetworkLog } from '../../types';
import { buildCurl } from '../../utils/buildCurl';
import { buildMarkdown } from '../../utils/buildMarkdown';
import { formatBody } from '../../utils/parseBody';
import { parseUrl } from '../../utils/parseUrl';
import { redact, redactHeaders, redactStorageSnapshot } from '../../utils/redact';
import { ConsoleLogList } from './ConsoleLogList';
import { CheckIcon, CopyIcon, TerminalIcon } from './icons';

interface LogDetailProps {
  log: NetworkLog;
}

export function LogDetail({ log }: LogDetailProps) {
  const [copiedField, setCopiedField] = useState<'markdown' | 'curl' | 'url' | null>(null);

  const copy = (field: 'markdown' | 'curl' | 'url', text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(field);
        window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 2000);
      })
      .catch(console.error);
  };

  const redactedReqHeaders = redactHeaders(log.reqHeaders);
  const redactedResHeaders = redactHeaders(log.resHeaders);
  const redactedReqBody = log.reqBody != null ? redact(log.reqBody) : null;
  const redactedResBody = log.resBody != null ? redact(log.resBody) : null;
  const storageSnapshot = log.storageSnapshot != null ? redactStorageSnapshot(log.storageSnapshot) : null;
  const { origin, pathname, queryParams, hash } = parseUrl(log.url);
  const hasQueryParams = Object.keys(queryParams).length > 0;

  return (
    <div className="hl-animate-in border-t border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[9px] text-[var(--text-muted)]">{origin}</div>
          <button
            onClick={() => copy('url', log.url)}
            title="Copy full URL"
            className="group flex w-full min-w-0 items-center gap-1 text-left"
          >
            <span className="min-w-0 flex-1 font-mono text-[11px] break-all text-[var(--text-secondary)] group-hover:text-[var(--text)]">
              {pathname}
              {hash && <span className="text-[var(--accent)]">{hash}</span>}
            </span>
            {copiedField === 'url' ? (
              <CheckIcon className="h-3 w-3 shrink-0 text-[var(--success)]" />
            ) : (
              <CopyIcon className="h-3 w-3 shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <CopyButton
            label="cURL"
            Icon={TerminalIcon}
            copied={copiedField === 'curl'}
            onClick={() => copy('curl', buildCurl(log))}
          />
          <CopyButton
            label="MD"
            Icon={CopyIcon}
            copied={copiedField === 'markdown'}
            primary
            onClick={() => copy('markdown', buildMarkdown(log))}
          />
        </div>
      </div>

      {log.error && (
        <div className="mb-3 rounded-lg border border-[var(--danger)] bg-[var(--danger-tint)] px-3 py-2 font-mono text-[11px] text-[var(--danger)]">
          {log.error}
        </div>
      )}

      {hasQueryParams && (
        <Section title="QUERY PARAMS">
          <DetailBlock label={`${Object.keys(queryParams).length} param(s)`} data={queryParams} />
        </Section>
      )}

      <Section title="REQUEST">
        <DetailBlock label="Headers" data={redactedReqHeaders} />
        {redactedReqBody !== null && <DetailBlock label="Body" data={redactedReqBody} />}
      </Section>

      <Section title="RESPONSE">
        <DetailBlock label="Headers" data={redactedResHeaders} />
        {redactedResBody !== null && <DetailBlock label="Body" data={redactedResBody} />}
        {redactedResBody === null && (
          <p className="font-mono text-[11px] text-[var(--text-tertiary)]">(empty body)</p>
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
            <p className="text-[10px] text-[var(--warning)]">Snapshot truncated - some entries omitted.</p>
          )}
        </Section>
      )}
    </div>
  );
}

function CopyButton({
  label,
  Icon,
  copied,
  onClick,
  primary,
}: {
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  copied: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        copied
          ? 'flex items-center gap-1 rounded-lg bg-[var(--success)] px-2.5 py-1 text-xs font-medium text-white transition-colors'
          : primary
            ? 'flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]'
            : 'flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]'
      }
    >
      {copied ? <CheckIcon className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[9px] font-bold tracking-widest text-[var(--text-tertiary)]">{title}</div>
      {children}
    </div>
  );
}

function DetailBlock({ label, data }: { label: string; data: unknown }) {
  return (
    <div className="mb-2">
      <div className="mb-0.5 text-[9px] text-[var(--text-muted)]">{label}</div>
      <pre className="max-h-48 overflow-y-auto overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-code)] p-2 font-mono text-[11px] whitespace-pre-wrap break-all text-[var(--text-secondary)]">
        {formatBody(data)}
      </pre>
    </div>
  );
}
