import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { StatusBadge } from '../pages/StatusBadge';
import type { ContentItem, ContentStatus } from '../lib/types';

export function Field({ label, value, onChange, placeholder, type = 'text', min, max, step, required }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}{required ? ' *' : ''}</span>
      <input type={type} value={value} placeholder={placeholder} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 4, required }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}{required ? ' *' : ''}</span>
      <textarea value={value} placeholder={placeholder} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function SelectField({ label, value, onChange, options, required }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}{required ? ' *' : ''}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function JsonField({ label, value, onChange, required }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}{required ? ' *' : ''}</span>
      <textarea className="json-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function ImageField({ label, imageUrl, imageAlt, onEditImage, onClearImage }: {
  label: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  onEditImage: () => void;
  onClearImage: () => void;
}) {
  return (
    <div className="field image-field">
      <span>{label}</span>
      {imageUrl ? (
        <div className="image-preview">
          <img src={imageUrl} alt={imageAlt ?? label} />
          <div className="image-preview-actions">
            <button className="button small" type="button" onClick={onEditImage}><ImageIcon size={16} /> Edit image</button>
            <button className="button ghost small" type="button" onClick={onClearImage}><Trash2 size={16} /> Remove</button>
          </div>
        </div>
      ) : (
        <button className="button secondary full" type="button" onClick={onEditImage}><ImageIcon size={16} /> Upload/edit image</button>
      )}
    </div>
  );
}

export function EditorActions({ status, saving, canPublish, onSaveDraft, onPublish, onArchive }: {
  status: ContentStatus;
  saving: boolean;
  canPublish: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onArchive?: () => void;
}) {
  return (
    <div className="editor-actions">
      <StatusBadge status={status} />
      <button className="button secondary" type="button" onClick={onSaveDraft} disabled={saving}>Save draft</button>
      {canPublish ? <button className="button primary" type="button" onClick={onPublish} disabled={saving}>Publish</button> : <span className="muted">Publishing requires publisher or admin role.</span>}
      {onArchive ? <button className="button ghost" type="button" onClick={onArchive} disabled={saving}>Archive</button> : null}
    </div>
  );
}

export function ContentCard({ item, selected, onSelect }: { item: ContentItem; selected?: boolean; onSelect: () => void }) {
  return (
    <button className={`content-card${selected ? ' selected' : ''}`} type="button" onClick={onSelect}>
      {item.image_public_url ? <img src={item.image_public_url} alt={item.image_alt ?? item.title ?? item.slug} /> : <div className="image-placeholder"><ImageIcon size={28} /></div>}
      <div>
        <strong>{item.title ?? item.slug}</strong>
        <small>{item.section} · {new Date(item.updated_at).toLocaleDateString()}</small>
        <StatusBadge status={item.status} />
      </div>
    </button>
  );
}
