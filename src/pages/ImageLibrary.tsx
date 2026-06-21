import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { listImages } from '../lib/storage';
import type { StorageAsset } from '../lib/types';

export function ImageLibraryPage() {
  const [images, setImages] = useState<StorageAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listImages().then((result) => {
      if (!result.error) setImages(result.data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Images</p>
          <h1>Image library</h1>
          <p className="muted">Review uploaded and edited assets stored in Supabase Storage.</p>
        </div>
      </header>

      {loading ? <p className="muted">Loading images…</p> : images.length === 0 ? (
        <section className="panel empty-state">
          <ImageIcon size={42} />
          <h2>No images yet</h2>
          <p>Upload images from the content editors. Edited images will appear here.</p>
        </section>
      ) : (
        <section className="image-grid">
          {images.map((image) => (
            <figure key={image.name}>
              <img src={image.publicUrl} alt={image.name} />
              <figcaption>
                <strong>{image.name}</strong>
                <small>{image.updated_at ? new Date(image.updated_at).toLocaleString() : 'Recently uploaded'}</small>
              </figcaption>
            </figure>
          ))}
        </section>
      )}
    </div>
  );
}
