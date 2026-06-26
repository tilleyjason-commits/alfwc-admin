import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { archiveContent, listContent, publishContent, saveContent } from '../lib/content';
import { canPublish } from '../lib/rbac';
import type { ContentItem, Json } from '../lib/types';
import { ContentCard, EditorActions, Field, ImageField, SelectField, TextAreaField } from '../components/forms';
import { ImageEditor } from '../components/ImageEditor';
import { PreviewFrame } from '../components/PreviewFrame';

function text(content: Record<string, Json>, key: string, fallback = '') {
  const value = content[key];
  return typeof value === 'string' ? value : fallback;
}

function bool(content: Record<string, Json>, key: string) {
  return content[key] === true;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event';
}

function emptyEvent(): ContentItem {
  return {
    id: '',
    section: 'event',
    slug: '',
    title: '',
    status: 'draft',
    content: {
      category: 'Ministry',
      startsAt: '',
      endsAt: '',
      locationName: '',
      address: '',
      description: '',
      registrationUrl: '',
      contactName: '',
      contactEmail: '',
      featured: false,
    },
    image_public_url: null,
    image_alt: null,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function EventsEditorPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ministry');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = async () => {
    const result = await listContent('event');
    if (!result.error && result.data) setItems(result.data as ContentItem[]);
  };

  useEffect(() => {
    let mounted = true;
    listContent('event').then((result) => {
      if (mounted && !result.error && result.data) setItems(result.data as ContentItem[]);
    });
    return () => { mounted = false; };
  }, []);

  const selectItem = (item: ContentItem) => {
    setSelected(item);
    setTitle(item.title ?? '');
    setCategory(text(item.content, 'category', 'Ministry'));
    setStartsAt(text(item.content, 'startsAt'));
    setEndsAt(text(item.content, 'endsAt'));
    setLocationName(text(item.content, 'locationName'));
    setAddress(text(item.content, 'address'));
    setDescription(text(item.content, 'description'));
    setRegistrationUrl(text(item.content, 'registrationUrl'));
    setContactName(text(item.content, 'contactName'));
    setContactEmail(text(item.content, 'contactEmail'));
    setFeatured(bool(item.content, 'featured'));
    setImageUrl(item.image_public_url ?? null);
    setImageAlt(item.image_alt ?? null);
    setError(null);
    setMessage(null);
  };

  const newEvent = () => selectItem(emptyEvent());

  const currentContent = (): Record<string, Json> => ({
    category,
    startsAt,
    endsAt,
    locationName,
    address,
    description,
    registrationUrl,
    contactName,
    contactEmail,
    featured,
  });

  const saveDraft = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const slug = selected?.slug || slugify(title);
    const result = await saveContent({
      section: 'event',
      slug,
      title,
      status: 'draft',
      content: currentContent(),
      imagePublicUrl: imageUrl,
      imageAlt,
      sortOrder: items.length,
    }, 'Saved event draft');

    if (result.error) setError(result.error.message);
    else {
      const saved = result.data as ContentItem;
      setSelected(saved);
      await reload();
      setMessage('Event draft saved.');
    }
    setSaving(false);
  };

  const publish = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await publishContent(selected.id, 'Published event');
    if (result.error) setError(result.error.message);
    else {
      const published = result.data as ContentItem;
      setSelected(published);
      await reload();
      setMessage('Event published.');
    }
    setSaving(false);
  };

  const archive = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await archiveContent(selected.id, 'Archived event');
    if (result.error) setError(result.error.message);
    else {
      setSelected(null);
      await reload();
      setMessage('Event archived.');
    }
    setSaving(false);
  };

  const draftItem: ContentItem | null = selected ? { ...selected, title, status: 'draft', content: currentContent(), image_public_url: imageUrl, image_alt: imageAlt } : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Events</p>
          <h1>Events</h1>
          <p className="muted">Manage church events with details, images, registration links, and publish controls.</p>
        </div>
        <button className="button primary" type="button" onClick={newEvent}><Plus size={16} /> New event</button>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="success-banner">{message}</div> : null}

      {editingImage ? (
        <ImageEditor prefix="events" initialUrl={imageUrl} initialAlt={imageAlt} onCancel={() => setEditingImage(false)} onSaved={(url, alt) => { setImageUrl(url); setImageAlt(alt); setEditingImage(false); }} />
      ) : (
        <div className="grid-two wide-left">
          <section className="panel">
            <div className="content-list">
              {items.map((item) => <ContentCard key={item.id} item={item} selected={selected?.id === item.id} onSelect={() => selectItem(item)} />)}
            </div>

            <EditorActions status={selected?.status ?? 'draft'} saving={saving} canPublish={canPublish(profile?.role)} onSaveDraft={saveDraft} onPublish={publish} onArchive={selected ? archive : undefined} />

            <div className="form-grid">
              <Field label="Title" value={title} onChange={setTitle} required />
              <SelectField label="Category" value={category} onChange={setCategory} options={[
                { value: 'Ministry', label: 'Ministry' },
                { value: 'Service', label: 'Service' },
                { value: 'Outreach', label: 'Outreach' },
                { value: 'Youth', label: 'Youth' },
                { value: 'Kids', label: 'Kids' },
                { value: 'Other', label: 'Other' },
              ]} />
              <Field label="Starts at" type="datetime-local" value={startsAt} onChange={setStartsAt} />
              <Field label="Ends at" type="datetime-local" value={endsAt} onChange={setEndsAt} />
              <Field label="Location name" value={locationName} onChange={setLocationName} />
              <Field label="Address" value={address} onChange={setAddress} />
              <TextAreaField label="Description" value={description} onChange={setDescription} rows={5} />
              <Field label="Registration URL" value={registrationUrl} onChange={setRegistrationUrl} />
              <Field label="Contact name" value={contactName} onChange={setContactName} />
              <Field label="Contact email" value={contactEmail} onChange={setContactEmail} />
              <label className="checkbox-row"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured event</label>
              <ImageField label="Event image" imageUrl={imageUrl} imageAlt={imageAlt} onEditImage={() => setEditingImage(true)} onClearImage={() => { setImageUrl(null); setImageAlt(null); }} />
            </div>
          </section>

          <PreviewFrame item={draftItem} title="Preview">
            {imageUrl ? <img className="preview-image" src={imageUrl} alt={imageAlt ?? title} /> : <div className="preview-image-placeholder">Event image</div>}
            <h3>{title || 'Untitled event'}</h3>
            <p>{category}</p>
            <p>{startsAt ? new Date(startsAt).toLocaleString() : 'Date not set'}</p>
            <p>{locationName || 'Location not set'}</p>
            <p>{description || 'Description will appear here.'}</p>
          </PreviewFrame>
        </div>
      )}
    </div>
  );
}
