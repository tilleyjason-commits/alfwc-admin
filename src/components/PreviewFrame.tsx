import { Smartphone } from 'lucide-react';
import type { ContentItem } from '../lib/types';

export function PreviewFrame({ item, title, children }: { item?: ContentItem | null; title: string; children: React.ReactNode }) {
  return (
    <div className="panel preview-panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p className="muted">Preview how this content appears in the app before publishing.</p>
        </div>
        <Smartphone size={24} />
      </div>

      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-content">
          {item ? <p className="eyebrow">{item.status}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
