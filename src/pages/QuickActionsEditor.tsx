import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { archiveContent, getContent, publishContent, saveContent } from '../lib/content';
import { canPublish } from '../lib/rbac';
import type { ContentItem, Json } from '../lib/types';
import { EditorActions, Field, SelectField } from '../components/forms';
import { PreviewFrame } from '../components/PreviewFrame';

type QuickAction = { label: string; icon: string; destination: string; enabled: boolean };

const iconOptions = ['church', 'calendar-alt', 'hand-holding-heart', 'pray', 'id-card', 'map-marker-alt', 'users', 'book-open', 'heart', 'star'].map((icon) => ({ value: icon, label: icon }));

function actionList(content: Record<string, Json>) {
  const items = content.items;
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item !== 'object' || item === null) return { label: '', icon: 'church', destination: '', enabled: true };
    const record = item as Record<string, Json>;
    return {
      label: typeof record.label === 'string' ? record.label : '',
      icon: typeof record.icon === 'string' ? record.icon : 'church',
      destination: typeof record.destination === 'string' ? record.destination : '',
      enabled: record.enabled !== false,
    };
  });
}

export function QuickActionsEditorPage() {
  const { profile } = useAuth();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getContent('quick_action', 'quick_actions').then(({ data, error: fetchError }) => {
      if (fetchError || !data) return;
      const next = data as ContentItem;
      setItem(next);
      setActions(actionList(next.content));
    });
  }, []);

  const updateAction = (index: number, patch: Partial<QuickAction>) => {
    setActions((current) => current.map((action, actionIndex) => actionIndex === index ? { ...action, ...patch } : action));
  };

  const addAction = () => setActions((current) => [...current, { label: 'New action', icon: 'church', destination: '/', enabled: true }]);
  const removeAction = (index: number) => setActions((current) => current.filter((_, actionIndex) => actionIndex !== index));
  const moveAction = (index: number, direction: -1 | 1) => {
    setActions((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const content = (): Record<string, Json> => ({ items: actions });

  const saveDraft = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await saveContent({
      section: 'quick_action',
      slug: 'quick_actions',
      title: 'Quick actions',
      status: 'draft',
      content: content(),
      sortOrder: 0,
    }, 'Saved quick action draft');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Quick actions draft saved.');
    }
    setSaving(false);
  };

  const publish = async () => {
    if (!item) return;
    setSaving(true);
    const result = await publishContent(item.id, 'Published quick actions');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Quick actions published.');
    }
    setSaving(false);
  };

  const archive = async () => {
    if (!item) return;
    setSaving(true);
    const result = await archiveContent(item.id, 'Archived quick actions');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Quick actions archived.');
    }
    setSaving(false);
  };

  const draftItem: ContentItem | null = item ? { ...item, status: 'draft', content: content() } : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Quick actions</p>
          <h1>Quick actions</h1>
          <p className="muted">Edit labels, icons, destinations, and enabled state without changing the app layout.</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="success-banner">{message}</div> : null}

      <div className="grid-two wide-left">
        <section className="panel">
          <EditorActions status={item?.status ?? 'draft'} saving={saving} canPublish={canPublish(profile?.role)} onSaveDraft={saveDraft} onPublish={publish} onArchive={archive} />
          <div className="action-list">
            {actions.map((action, index) => (
              <div className="action-row" key={`${action.label}-${index}`}>
                <div className="action-row-grid">
                  <Field label="Label" value={action.label} onChange={(value) => updateAction(index, { label: value })} />
                  <SelectField label="Icon" value={action.icon} onChange={(value) => updateAction(index, { icon: value })} options={iconOptions} />
                  <Field label="Destination" value={action.destination} onChange={(value) => updateAction(index, { destination: value })} />
                  <label className="checkbox-row"><input type="checkbox" checked={action.enabled} onChange={(event) => updateAction(index, { enabled: event.target.checked })} /> Enabled</label>
                </div>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => moveAction(index, -1)} disabled={index === 0}><ArrowUp size={16} /></button>
                  <button className="icon-button" type="button" onClick={() => moveAction(index, 1)} disabled={index === actions.length - 1}><ArrowDown size={16} /></button>
                  <button className="icon-button danger" type="button" onClick={() => removeAction(index)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <button className="button secondary" type="button" onClick={addAction}><Plus size={16} /> Add action</button>
        </section>

        <PreviewFrame item={draftItem} title="Preview">
          <div className="preview-actions">
            {actions.filter((action) => action.enabled).map((action) => <button className="button secondary full" type="button" key={`${action.label}-${action.destination}`}>{action.label}</button>)}
          </div>
        </PreviewFrame>
      </div>
    </div>
  );
}
