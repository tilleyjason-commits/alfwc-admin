import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { archiveContent, getContent, publishContent, saveContent } from '../lib/content';
import { canPublish } from '../lib/rbac';
import type { ContentItem, Json } from '../lib/types';
import { EditorActions, Field, TextAreaField } from '../components/forms';
import { PreviewFrame } from '../components/PreviewFrame';

function text(content: Record<string, Json>, key: string, fallback = '') {
  const value = content[key];
  return typeof value === 'string' ? value : fallback;
}

function lines(content: Record<string, Json>, key: string) {
  const value = content[key];
  return Array.isArray(value) ? value.map(String).join('\n') : typeof value === 'string' ? value : '';
}

export function OnboardingEditorPage() {
  const { profile } = useAuth();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeBody, setWelcomeBody] = useState('');
  const [location, setLocation] = useState('');
  const [roleOptions, setRoleOptions] = useState('');
  const [interests, setInterests] = useState('');
  const [notificationNotice, setNotificationNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getContent('onboarding', 'onboarding').then(({ data, error: fetchError }) => {
      if (fetchError || !data) return;
      const next = data as ContentItem;
      setItem(next);
      setWelcomeTitle(text(next.content, 'welcomeTitle'));
      setWelcomeBody(text(next.content, 'welcomeBody'));
      setLocation(text(next.content, 'location'));
      setRoleOptions(lines(next.content, 'roleOptions'));
      setInterests(lines(next.content, 'interests'));
      setNotificationNotice(text(next.content, 'notificationNotice'));
    });
  }, []);

  const content = (): Record<string, Json> => ({
    welcomeTitle,
    welcomeBody,
    location,
    roleOptions: roleOptions.split('\n').map((line) => line.trim()).filter(Boolean),
    interests: interests.split('\n').map((line) => line.trim()).filter(Boolean),
    notificationNotice,
  });

  const saveDraft = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await saveContent({ section: 'onboarding', slug: 'onboarding', title: 'Onboarding', status: 'draft', content: content(), sortOrder: 0 }, 'Saved onboarding draft');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Onboarding draft saved.');
    }
    setSaving(false);
  };

  const publish = async () => {
    if (!item) return;
    setSaving(true);
    const result = await publishContent(item.id, 'Published onboarding');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Onboarding published.');
    }
    setSaving(false);
  };

  const archive = async () => {
    if (!item) return;
    setSaving(true);
    const result = await archiveContent(item.id, 'Archived onboarding');
    if (result.error) setError(result.error.message);
    else {
      setItem(result.data as ContentItem);
      setMessage('Onboarding archived.');
    }
    setSaving(false);
  };

  const draftItem: ContentItem | null = item ? { ...item, status: 'draft', content: content() } : null;
  const current = content();
  const roleOptionList = Array.isArray(current.roleOptions) ? current.roleOptions.filter((option): option is string => typeof option === 'string') : [];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1>Onboarding copy</h1>
          <p className="muted">Update welcome text, role choices, interest options, and notification copy.</p>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {message ? <div className="success-banner">{message}</div> : null}

      <div className="grid-two wide-left">
        <section className="panel">
          <EditorActions status={item?.status ?? 'draft'} saving={saving} canPublish={canPublish(profile?.role)} onSaveDraft={saveDraft} onPublish={publish} onArchive={archive} />
          <div className="form-grid">
            <Field label="Welcome title" value={welcomeTitle} onChange={setWelcomeTitle} />
            <TextAreaField label="Welcome body" value={welcomeBody} onChange={setWelcomeBody} rows={5} />
            <Field label="Location" value={location} onChange={setLocation} />
            <TextAreaField label="Role options" value={roleOptions} onChange={setRoleOptions} placeholder="One option per line" />
            <TextAreaField label="Interests" value={interests} onChange={setInterests} placeholder="One interest per line" />
            <TextAreaField label="Notification notice" value={notificationNotice} onChange={setNotificationNotice} rows={4} />
          </div>
        </section>

        <PreviewFrame item={draftItem} title="Preview">
          <div className="preview-onboarding">
            <h3>{welcomeTitle || 'Welcome to Abundant Life'}</h3>
            <p>{welcomeBody || 'Welcome copy will appear here.'}</p>
            <strong>{location}</strong>
            <div className="preview-list">
              {roleOptionList.map((option) => <span key={option}>{option}</span>)}
            </div>
          </div>
        </PreviewFrame>
      </div>
    </div>
  );
}
