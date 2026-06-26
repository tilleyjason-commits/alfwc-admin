import { useEffect, useMemo, useState } from 'react';
import { listAuditEventItems, listContentItems, listRevisionItems } from '../lib/content';
import type { AuditEvent, ContentRevision } from '../lib/types';
import { StatusBadge } from './StatusBadge';

export function DashboardPage() {
  const [contentCount, setContentCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [recentRevisions, setRecentRevisions] = useState<ContentRevision[]>([]);
  const [recentAudit, setRecentAudit] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([listContentItems(100), listRevisionItems(8), listAuditEventItems(8)]).then(([content, revisions, audit]) => {
      if (!mounted) return;
      const items = content.data ?? [];
      setContentCount(items.length);
      setDraftCount(items.filter((item) => item.status === 'draft').length);
      setRecentRevisions(revisions.data ?? []);
      setRecentAudit(audit.data ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => [
    { label: 'Content items', value: contentCount, tone: 'primary' },
    { label: 'Drafts waiting', value: draftCount, tone: 'warning' },
    { label: 'Recent revisions', value: recentRevisions.length, tone: 'neutral' },
    { label: 'Recent audit events', value: recentAudit.length, tone: 'neutral' },
  ], [contentCount, draftCount, recentAudit.length, recentRevisions.length]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Church app content control center</h1>
          <p className="muted">Review what is live, what is still in draft, and what changed recently.</p>
        </div>
      </header>

      {loading ? <p className="muted">Loading dashboard…</p> : (
        <>
          <section className="stats-grid">
            {stats.map((stat) => <div key={stat.label} className={`stat-card ${stat.tone}`}><span>{stat.value}</span><small>{stat.label}</small></div>)}
          </section>

          <section className="grid-two">
            <div className="panel">
              <h2>Recent revisions</h2>
              {recentRevisions.length === 0 ? <p className="muted">No revisions yet.</p> : (
                <ul className="compact-list">
                  {recentRevisions.map((revision) => <li key={revision.id}><strong>{revision.status}</strong><span>{new Date(revision.created_at).toLocaleString()}</span></li>)}
                </ul>
              )}
            </div>

            <div className="panel">
              <h2>Audit trail</h2>
              {recentAudit.length === 0 ? <p className="muted">No audit events yet.</p> : (
                <ul className="compact-list">
                  {recentAudit.map((event) => (
                    <li key={event.id}>
                      <StatusBadge status={event.action} />
                      <span>{event.action} · {event.entity_type}</span>
                      <small>{event.actor_email ?? 'System'} · {new Date(event.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
