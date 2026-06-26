import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { archiveContent, getContent, publishContent, saveContent } from '../lib/content';
import { canPublish } from '../lib/rbac';
import type { ContentItem, Json } from '../lib/types';
import { EditorActions, Field } from '../components/forms';
import { PreviewFrame } from '../components/PreviewFrame';

function text(content: Record<string, Json>, key: string, fallback = '') {
  const value = content[key];
  return typeof value === 'string' ? value : fallback;
}

export function LinksEditorPage() {
  const { profile } = useAuth();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [givingUrl, setGivingUrl] = useState('');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [planningCenterUrl, setPlanningCenterUrl] = useState('');
  const [ccbLoginUrl, setCcbLoginUrl] = useState('');
  const [prayerUrl, setPrayerUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getContent('links', 'links').then(({ data, error: fetchError }) => {
      if (fetchError || !data) return;
      const next = data as ContentItem;
      setItem(next);
      setGivingUrl(text(next.content, 'givingUrl'));
      setYoutubeChannelUrl(text(next.content, 'youtubeChannelUrl'));
      setFacebookUrl(text(next.content, 'facebookUrl'));
      setInstagramUrl(text(next.content, 'instagramUrl'));
      setPlanningCenterUrl(text(next.content, 'planningCenterUrl'));
      setCcbLoginUrl(text(next.content, 'ccbLoginUrl'));
      setPrayerUrl(text(next.content, 'prayerUrl'));
    });
  }, []);

  const content = (): Record<string, Json> => ({
    givingUrl,
    youtubeChannelUrl,
    facebookUrl,
    instagramUrl,
    planningCenterUrl,
    ccbLoginUrl,
    prayerUrl,
  });

  const saveDraft = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await saveContent({ section: 'links', slug: 'links', title: 'App links', status: 'draft', content: content(), sortOrder: 0 }, 'Saved links draft');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Links draft saved.');
    }
    setSaving(false);
  };

  const publish = async () => {
    if (!item) return;
    setSaving(true);
    const result = await publishContent(item.id, 'Published links');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Links published.');
    }
    setSaving(false);
  };

  const archive = async () => {
    if (!item) return;
    setSaving(true);
    const result = await archiveContent(item.id, 'Archived links');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Links archived.');
    }
    setSaving(false);
  };

  const draftItem: ContentItem | null = item ? { ...item, status: 'draft', content: content() } : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Links</p>
          <h1>Links and external destinations</h1>
          <p className="muted">Keep giving, prayer, social, and ministry links current without touching app code.</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="success-banner">{message}</div> : null}

      <div className="grid-two wide-left">
        <section className="panel">
          <EditorActions status={item?.status ?? 'draft'} saving={saving} canPublish={canPublish(profile?.role)} onSaveDraft={saveDraft} onPublish={publish} onArchive={archive} />
          <div className="form-grid">
            <Field label="Giving URL" value={givingUrl} onChange={setGivingUrl} placeholder="https://..." />
            <Field label="YouTube channel URL" value={youtubeChannelUrl} onChange={setYoutubeChannelUrl} />
            <Field label="Facebook URL" value={facebookUrl} onChange={setFacebookUrl} />
            <Field label="Instagram URL" value={instagramUrl} onChange={setInstagramUrl} />
            <Field label="Planning Center URL" value={planningCenterUrl} onChange={setPlanningCenterUrl} />
            <Field label="CCB login URL" value={ccbLoginUrl} onChange={setCcbLoginUrl} />
            <Field label="Prayer request URL" value={prayerUrl} onChange={setPrayerUrl} />
          </div>
        </section>

        <PreviewFrame item={draftItem} title="Preview">
          <div className="preview-list links-preview">
            {[givingUrl, youtubeChannelUrl, facebookUrl, instagramUrl, planningCenterUrl, ccbLoginUrl, prayerUrl].filter(Boolean).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{url}</a>)}
          </div>
        </PreviewFrame>
      </div>
    </div>
  );
}
