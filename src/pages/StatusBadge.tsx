export function StatusBadge({ status }: { status?: string | null }) {
  const className = status === 'published'
    ? 'status-badge success'
    : status === 'draft'
      ? 'status-badge warning'
      : status === 'archived'
        ? 'status-badge muted'
        : 'status-badge neutral';

  return <span className={className}>{status ?? 'Unknown'}</span>;
}
