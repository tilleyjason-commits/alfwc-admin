import { useEffect, useState } from 'react';
import { listAuditEventItems, listRevisionItems } from '../lib/content';
import type { AuditEvent, ContentRevision } from '../lib/types';

export function HistoryPage() {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listRevisionItems(100), listAuditEventItems(100)]).then(([revisionResult, auditResult]) => {
      if (!revisionResult.error && revisionResult.data) setRevisions(revisionResult.data);
      if (!auditResult.error && auditResult.data) setAuditEvents(auditResult.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">History and safety</p>
          <h1>Revision and audit history</h1>
          <p className="muted">Track every draft, publish, archive, and content change for accountability.</p>
        </div>
      </header>

      {loading ? <p className="muted">Loading history…</p> : (
        <section className="grid-two">
          <div className="panel">
            <h2>Content revisions</h2>
            {revisions.length === 0 ? <p className="muted">No revisions yet.</p> : (
              <div className="history-list">
                {revisions.map((revision) => (
                  <article className="history-item" key={revision.id}>
                    <div>
                      <strong>{revision.status}</strong>
                      <small>Content {revision.content_id}</small>
                    </div>
                    <p>{revision.note ?? 'No note'}</p>
                    <small>{revision.created_by ?? 'System'} · {new Date(revision.created_at).toLocaleString()}</small>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <h2>Audit events</h2>
            {auditEvents.length === 0 ? <p className="muted">No audit events yet.</p> : (
              <div className="history-list">
                {auditEvents.map((event) => (
                  <article className="history-item" key={event.id}>
                    <div>
                      <strong>{event.action}</strong>
                      <small>{event.entity_type} · {event.entity_id ?? 'global'}</small>
                    </div>
                    <p>{event.actor_email ?? 'System'}</p>
                    <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
                    <small>{new Date(event.created_at).toLocaleString()}</small>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
