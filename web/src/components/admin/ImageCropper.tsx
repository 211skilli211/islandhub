'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw, Check, X, ZoomIn, ZoomOut } from 'lucide-react';

type ImageCropperProps = {
  src: string;
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // width/height, e.g. 16/9 = 1.778
};

export default function ImageCropper({ src, onComplete, onCancel, aspectRatio }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropSize, setCropSize] = useState({ w: 0, h: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);

      // Calculate initial crop size (80% of canvas, respecting aspect ratio)
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = canvas.width * 0.8;
      const maxH = canvas.height * 0.8;
      let w = maxW;
      let h = maxH;
      if (aspectRatio) {
        if (w / h > aspectRatio) {
          w = h * aspectRatio;
        } else {
          h = w / aspectRatio;
        }
      }
      setCropSize({ w, h });
    };
    img.src = src;
  }, [src, aspectRatio]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const scaledW = img.naturalWidth * zoom;
    const scaledH = img.naturalHeight * zoom;
    const dx = (canvas.width - scaledW) / 2 + offset.x;
    const dy = (canvas.height - scaledH) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, scaledW, scaledH);

    // Clear crop area (show image through)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const cx = (canvas.width - cropSize.w) / 2;
    const cy = (canvas.height - cropSize.h) / 2;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(cx, cy, cropSize.w, cropSize.h);
    ctx.restore();

    // Crop border
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(cx, cy, cropSize.w, cropSize.h);
    ctx.setLineDash([]);

    // Corner handles
    const handleSize = 8;
    ctx.fillStyle = '#fff';
    const corners = [
      [cx, cy], [cx + cropSize.w, cy],
      [cx, cy + cropSize.h], [cx + cropSize.w, cy + cropSize.h],
    ];
    corners.forEach(([x, y]) => {
      ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    });

    // Rule-of-thirds grid
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + (cropSize.w * i) / 3, cy);
      ctx.lineTo(cx + (cropSize.w * i) / 3, cy + cropSize.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + (cropSize.h * i) / 3);
      ctx.lineTo(cx + cropSize.w, cy + (cropSize.h * i) / 3);
      ctx.stroke();
    }
  }, [imageLoaded, zoom, offset, cropSize]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const cx = (canvas.width - cropSize.w) / 2;
    const cy = (canvas.height - cropSize.h) / 2;

    // Create output canvas at crop size
    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropSize.w;
    outCanvas.height = cropSize.h;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;

    // Calculate source coordinates from the original image
    const scaledW = img.naturalWidth * zoom;
    const scaledH = img.naturalHeight * zoom;
    const imgDx = (canvas.width - scaledW) / 2 + offset.x;
    const imgDy = (canvas.height - scaledH) / 2 + offset.y;

    const sx = ((cx - imgDx) / scaledW) * img.naturalWidth;
    const sy = ((cy - imgDy) / scaledH) * img.naturalHeight;
    const sw = (cropSize.w / scaledW) * img.naturalWidth;
    const sh = (cropSize.h / scaledH) * img.naturalHeight;

    outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, cropSize.w, cropSize.h);

    outCanvas.toBlob((blob) => {
      if (blob) onComplete(blob);
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <h3 className="text-sm font-bold text-ink-primary">Crop Image</h3>
          <button onClick={onCancel} className="p-1 text-ink-tertiary hover:text-ink-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Canvas */}
        <div className="relative bg-[#0a0f1a]">
          <canvas
            ref={canvasRef}
            width={640}
            height={400}
            className="w-full cursor-move touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        </div>

        {/* Controls */}
        <div className="px-4 py-3 border-t border-border-primary space-y-3">
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-ink-tertiary" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-accent-500"
            />
            <ZoomIn className="h-4 w-4 text-ink-tertiary" />
            <span className="text-[10px] text-ink-tertiary w-10 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-secondary bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-ink-secondary bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600 transition-colors"
              >
                <Check className="h-3 w-3" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
