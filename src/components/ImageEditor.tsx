import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Crop, Upload } from 'lucide-react';
import { uploadImage } from '../lib/storage';
import { Field } from './forms';

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

async function createCroppedCanvas(image: HTMLImageElement, crop: Area): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare image editor canvas.');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvas;
}

function canvasToPngFile(canvas: HTMLCanvasElement) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not export edited image.'));
        return;
      }
      resolve(new File([blob], `edited-${Date.now()}.png`, { type: 'image/png' }));
    }, 'image/png');
  });
}

export function ImageEditor({ prefix, initialUrl, initialAlt, onSaved, onCancel }: {
  prefix: string;
  initialUrl?: string | null;
  initialAlt?: string | null;
  onSaved: (url: string, alt: string) => void;
  onCancel: () => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialUrl ?? null);
  const [alt, setAlt] = useState(initialAlt ?? 'ALFWC image');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(42);
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => setImageSrc(String(reader.result ?? '')));
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveEditedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setError(null);

    try {
      const image = await createImage(imageSrc);
      const canvas = await createCroppedCanvas(image, croppedAreaPixels);
      const ctx = canvas.getContext('2d');

      if (ctx && overlayText.trim()) {
        ctx.save();
        ctx.font = `900 ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = Math.max(4, fontSize / 8);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        const x = (textX / 100) * canvas.width;
        const y = (textY / 100) * canvas.height;
        ctx.strokeText(overlayText, x, y, canvas.width * 0.9);
        ctx.fillText(overlayText, x, y, canvas.width * 0.9);
        ctx.restore();
      }

      const file = await canvasToPngFile(canvas);
      const result = await uploadImage(file, prefix);
      if (result.error) throw result.error;

      onSaved(result.data.publicUrl, alt);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save edited image.');
    } finally {
      setBusy(false);
    }
  }, [alt, croppedAreaPixels, fontSize, imageSrc, onSaved, overlayText, prefix, textColor, textX, textY]);

  return (
    <div className="image-editor">
      <div className="image-editor-toolbar">
        <label className="button primary">
          <Upload size={16} />
          Upload image
          <input hidden type="file" accept="image/*" onChange={onFileChange} />
        </label>
        {imageSrc ? <span className="muted">Crop, zoom, and add text before saving.</span> : <span className="muted">Upload an image to begin editing.</span>}
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {imageSrc ? (
        <div className="image-editor-grid">
          <div className="crop-stage">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1.25}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="panel compact-form">
            <h3>Edit image</h3>
            <Field label="Alt text" value={alt} onChange={(value) => setAlt(value)} />
            <Field label="Text overlay" value={overlayText} onChange={setOverlayText} placeholder="Example: Sunday 10 AM" />
            <div className="inline-fields two">
              <Field label="Text color" type="color" value={textColor} onChange={setTextColor} />
              <Field label="Font size" type="number" value={String(fontSize)} onChange={(value) => setFontSize(Number(value) || 24)} />
            </div>
            <div className="inline-fields two">
              <Field label="Text X %" type="number" value={String(textX)} onChange={(value) => setTextX(Number(value))} />
              <Field label="Text Y %" type="number" value={String(textY)} onChange={(value) => setTextY(Number(value))} />
            </div>
            <Field label="Zoom" type="range" value={String(zoom)} min="1" max="3" step="0.05" onChange={(value) => setZoom(Number(value))} />
            <div className="button-row">
              <button className="button primary" type="button" onClick={() => void saveEditedImage()} disabled={busy}>
                <Crop size={16} />
                {busy ? 'Saving…' : 'Save edited image'}
              </button>
              <button className="button ghost" type="button" onClick={onCancel}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
