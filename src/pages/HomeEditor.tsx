import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { archiveContent, getContent, publishContent, saveContent } from '../lib/content';
import type { ContentItem, Json } from '../lib/types';
import { EditorActions, Field, ImageField, TextAreaField } from '../components/forms';
import { ImageEditor } from '../components/ImageEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { canPublish } from '../lib/rbac';

function text(content: Record<string, Json>, key: string, fallback = '') {
  const value = content[key];
  return typeof value === 'string' ? value : fallback;
}

function lines(content: Record<string, Json>, key: string) {
  const value = content[key];
  return Array.isArray(value) ? value.map(String).join('\n') : typeof value === 'string' ? value : '';
}

export function HomeEditorPage() {
  const { profile } = useAuth();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [title, setTitle] = useState('');
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeBody, setWelcomeBody] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [serviceTimes, setServiceTimes] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getContent('home', 'home').then(({ data, error: fetchError }) => {
      if (fetchError || !data) return;
      const next = data as ContentItem;
      setItem(next);
      setTitle(next.title ?? 'Welcome home');
      setWelcomeTitle(text(next.content, 'welcomeTitle', 'Welcome to Abundant Life'));
      setWelcomeBody(text(next.content, 'welcomeBody'));
      setLocationLabel(text(next.content, 'locationLabel'));
      setCtaLabel(text(next.content, 'ctaLabel'));
      setCtaUrl(text(next.content, 'ctaUrl'));
      setServiceTimes(lines(next.content, 'serviceTimes'));
      setAddress(text(next.content, 'address'));
      setPhone(text(next.content, 'phone'));
      setEmail(text(next.content, 'email'));
      setImageUrl(next.image_public_url ?? null);
      setImageAlt(next.image_alt ?? null);
    });
  }, []);

  const currentContent = (): Record<string, Json> => ({
    welcomeTitle,
    welcomeBody,
    locationLabel,
    ctaLabel,
    ctaUrl,
    serviceTimes: serviceTimes.split('\n').map((line) => line.trim()).filter(Boolean),
    address,
    phone,
    email,
  });

  const saveDraft = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await saveContent({
      section: 'home',
      slug: 'home',
      title,
      status: 'draft',
      content: currentContent(),
      imagePublicUrl: imageUrl,
      imageAlt,
      sortOrder: 0,
    }, 'Saved home draft');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Draft saved.');
    }
    setSaving(false);
  };

  const publish = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);
    const result = await publishContent(item.id, 'Published home content');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Home content published.');
    }
    setSaving(false);
  };

  const archive = async () => {
    if (!item) return;
    setSaving(true);
    const result = await archiveContent(item.id, 'Archived home content');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Home content archived.');
    }
    setSaving(false);
  };

  const draftItem: ContentItem | null = item ? { ...item, title, status: 'draft', content: currentContent(), image_public_url: imageUrl, image_alt: imageAlt } : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Home</p>
          <h1>Edit home screen</h1>
          <p className="muted">Update welcome copy, service times, location, hero image, and the primary call to action.</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="success-banner">{message}</div> : null}

      {editingImage ? (
        <ImageEditor prefix="home" initialUrl={imageUrl} initialAlt={imageAlt} onCancel={() => setEditingImage(false)} onSaved={(url, alt) => { setImageUrl(url); setImageAlt(alt); setEditingImage(false); }} />
      ) : (
        <div className="grid-two wide-left">
          <section className="panel">
            <EditorActions status={item?.status ?? 'draft'} saving={saving} canPublish={canPublish(profile?.role)} onSaveDraft={saveDraft} onPublish={publish} onArchive={archive} />
            <div className="form-grid">
              <Field label="Page title" value={title} onChange={setTitle} required />
              <Field label="Welcome title" value={welcomeTitle} onChange={setWelcomeTitle} />
              <TextAreaField label="Welcome body" value={welcomeBody} onChange={setWelcomeBody} rows={5} />
              <Field label="Location label" value={locationLabel} onChange={setLocationLabel} />
              <Field label="CTA label" value={ctaLabel} onChange={setCtaLabel} />
              <Field label="CTA destination" value={ctaUrl} onChange={setCtaUrl} placeholder="/PlanVisit" />
              <TextAreaField label="Service times" value={serviceTimes} onChange={setServiceTimes} placeholder="One service time per line" />
              <Field label="Address" value={address} onChange={setAddress} />
              <Field label="Phone" value={phone} onChange={setPhone} />
              <Field label="Email" value={email} onChange={setEmail} />
              <ImageField label="Hero image" imageUrl={imageUrl} imageAlt={imageAlt} onEditImage={() => setEditingImage(true)} onClearImage={() => { setImageUrl(null); setImageAlt(null); }} />
            </div>
          </section>

          <PreviewFrame item={draftItem} title="Preview">
            <div className="preview-home">
              {imageUrl ? <img src={imageUrl} alt={imageAlt ?? welcomeTitle} /> : <div className="preview-image-placeholder">Hero image</div>}
              <h3>{welcomeTitle}</h3>
              <p>{welcomeBody}</p>
              <strong>{locationLabel}</strong>
              <div className="preview-list">
                {(currentContent().serviceTimes as string[] | undefined)?.map((line) => <span key={line}>{line}</span>)}
              </div>
              <button className="button primary full" type="button">{ctaLabel || 'Plan a visit'}</button>
            </div>
          </PreviewFrame>
        </div>
      )}
    </div>
  );
}
