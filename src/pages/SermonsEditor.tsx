import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { archiveContent, listContent, publishContent, saveContent } from '../lib/content';
import { canPublish } from '../lib/rbac';
import type { ContentItem, Json } from '../lib/types';
import { ContentCard, EditorActions, Field, ImageField, TextAreaField } from '../components/forms';
import { ImageEditor } from '../components/ImageEditor';
import { PreviewFrame } from '../components/PreviewFrame';

function text(content: Record<string, Json>, key: string, fallback = '') {
  const value = content[key];
  return typeof value === 'string' ? value : fallback;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sermon';
}

function emptySermon(): ContentItem {
  return {
    id: '',
    section: 'sermon',
    slug: '',
    title: '',
    status: 'draft',
    content: {
      speaker: '',
      series: '',
      scriptureReference: '',
      description: '',
      watchUrl: '',
      discussionQuestions: '',
      prayerPrompt: '',
    },
    image_public_url: null,
    image_alt: null,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function SermonsEditorPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [series, setSeries] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [description, setDescription] = useState('');
  const [watchUrl, setWatchUrl] = useState('');
  const [discussionQuestions, setDiscussionQuestions] = useState('');
  const [prayerPrompt, setPrayerPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = async () => {
    const result = await listContent('sermon');
    if (!result.error && result.data) setItems(result.data as ContentItem[]);
  };

  useEffect(() => {
    let mounted = true;
    listContent('sermon').then((result) => {
      if (mounted && !result.error && result.data) setItems(result.data as ContentItem[]);
    });
    return () => { mounted = false; };
  }, []);

  const selectItem = (item: ContentItem) => {
    setSelected(item);
    setTitle(item.title ?? '');
    setSpeaker(text(item.content, 'speaker'));
    setSeries(text(item.content, 'series'));
    setScriptureReference(text(item.content, 'scriptureReference'));
    setDescription(text(item.content, 'description'));
    setWatchUrl(text(item.content, 'watchUrl'));
    setDiscussionQuestions(text(item.content, 'discussionQuestions'));
    setPrayerPrompt(text(item.content, 'prayerPrompt'));
    setImageUrl(item.image_public_url ?? null);
    setImageAlt(item.image_alt ?? null);
    setError(null);
    setMessage(null);
  };

  const newSermon = () => selectItem(emptySermon());

  const currentContent = (): Record<string, Json> => ({
    speaker,
    series,
    scriptureReference,
    description,
    watchUrl,
    discussionQuestions,
    prayerPrompt,
  });

  const saveDraft = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const slug = selected?.slug || slugify(title);
    const result = await saveContent({
      section: 'sermon',
      slug,
      title,
      status: 'draft',
      content: currentContent(),
      imagePublicUrl: imageUrl,
      imageAlt,
      sortOrder: items.length,
    }, 'Saved sermon draft');

    if (result.error) setError(result.error.message);
    else {
      const saved = result.data as ContentItem;
      setSelected(saved);
      await reload();
      setMessage('Sermon draft saved.');
    }
    setSaving(false);
  };

  const publish = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await publishContent(selected.id, 'Published sermon');
    if (result.error) setError(result.error.message);
    else {
      const published = result.data as ContentItem;
      setSelected(published);
      await reload();
      setMessage('Sermon published.');
    }
    setSaving(false);
  };

  const archive = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await archiveContent(selected.id, 'Archived sermon');
    if (result.error) setError(result.error.message);
    else {
      setSelected(null);
      await reload();
      setMessage('Sermon archived.');
    }
    setSaving(false);
  };

  const draftItem: ContentItem | null = selected ? { ...selected, title, status: 'draft', content: currentContent(), image_public_url: imageUrl, image_alt: imageAlt } : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sermons</p>
          <h1>Sermon library</h1>
          <p className="muted">Create sermon entries, attach media/images, save drafts, preview, and publish when ready.</p>
        </div>
        <button className="button primary" type="button" onClick={newSermon}><Plus size={16} /> New sermon</button>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="success-banner">{message}</div> : null}

      {editingImage ? (
        <ImageEditor prefix="sermons" initialUrl={imageUrl} initialAlt={imageAlt} onCancel={() => setEditingImage(false)} onSaved={(url, alt) => { setImageUrl(url); setImageAlt(alt); setEditingImage(false); }} />
      ) : (
        <div className="grid-two wide-left">
          <section className="panel">
            <div className="content-list">
              {items.map((item) => <ContentCard key={item.id} item={item} selected={selected?.id === item.id} onSelect={() => selectItem(item)} />)}
            </div>

            <EditorActions status={selected?.status ?? 'draft'} saving={saving} canPublish={canPublish(profile?.role)} onSaveDraft={saveDraft} onPublish={publish} onArchive={selected ? archive : undefined} />

            <div className="form-grid">
              <Field label="Title" value={title} onChange={setTitle} required />
              <Field label="Speaker" value={speaker} onChange={setSpeaker} />
              <Field label="Series" value={series} onChange={setSeries} />
              <Field label="Scripture reference" value={scriptureReference} onChange={setScriptureReference} />
              <TextAreaField label="Description" value={description} onChange={setDescription} rows={5} />
              <Field label="Watch URL" value={watchUrl} onChange={setWatchUrl} placeholder="https://youtube.com/..." />
              <TextAreaField label="Discussion questions" value={discussionQuestions} onChange={setDiscussionQuestions} placeholder="One question per line" rows={4} />
              <TextAreaField label="Prayer prompt" value={prayerPrompt} onChange={setPrayerPrompt} rows={3} />
              <ImageField label="Sermon image" imageUrl={imageUrl} imageAlt={imageAlt} onEditImage={() => setEditingImage(true)} onClearImage={() => { setImageUrl(null); setImageAlt(null); }} />
            </div>
          </section>

          <PreviewFrame item={draftItem} title="Preview">
            {imageUrl ? <img className="preview-image" src={imageUrl} alt={imageAlt ?? title} /> : <div className="preview-image-placeholder">Sermon image</div>}
            <h3>{title || 'Untitled sermon'}</h3>
            <p>{speaker ? `Speaker: ${speaker}` : 'Speaker not set'}</p>
            <p>{scriptureReference || 'Scripture reference not set'}</p>
            <p>{description || 'Description will appear here.'}</p>
          </PreviewFrame>
        </div>
      )}
    </div>
  );
}
