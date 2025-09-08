import React, { useEffect, useMemo, useRef, useState } from "react";
import { getTemplateById } from "../utils/templates";
import type { BadgeImage } from "../types/badge";

interface ImagePositioningProps {
  image: string;
  type: "background" | "logo";
  onSave: (positionedImage: BadgeImage) => void;
  onCancel: () => void;
  templateId?: string;
  badgeLogo?: BadgeImage;
  badgeBackgroundImage?: BadgeImage;
  backgroundColor?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const ImagePositioning: React.FC<ImagePositioningProps> = ({
  image,
  type,
  onSave,
  onCancel,
  templateId = "rect-1x3",
  badgeLogo,
  badgeBackgroundImage,
  backgroundColor = "#f9fafb",
}) => {
  const template = useMemo(() => getTemplateById(templateId), [templateId]);
  const ART_W = template.artboardWidth ?? 300;
  const ART_H = template.artboardHeight ?? 100;

  // UI runs at 3x for easier manipulation
  const UI_SCALE = 3;
  const UI_W = ART_W * UI_SCALE;
  const UI_H = ART_H * UI_SCALE;

  // Image geo
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const existing = type === "logo" ? badgeLogo : badgeBackgroundImage;
    return existing ? { x: existing.x * UI_SCALE, y: existing.y * UI_SCALE } : { x: 0, y: 0 };
  });
  const [scale, setScale] = useState<number>(() => {
    const existing = type === "logo" ? badgeLogo : badgeBackgroundImage;
    return existing ? existing.scale * UI_SCALE : 0.35;
  });

  // Dragging state
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);

  // RAF batching
  const nextFrameRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
  const pendingScaleRef = useRef<number | null>(null);
  const requestFlush = () => {
    if (nextFrameRef.current != null) return;
    nextFrameRef.current = requestAnimationFrame(() => {
      nextFrameRef.current = null;
      if (pendingPosRef.current) {
        setPos(pendingPosRef.current);
        pendingPosRef.current = null;
      }
      if (pendingScaleRef.current != null) {
        setScale(pendingScaleRef.current);
        pendingScaleRef.current = null;
      }
    });
  };

  // Center new images when loaded (if no existing placement)
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const sw = iw * scale;
      const sh = ih * scale;
      const existing = type === "logo" ? badgeLogo : badgeBackgroundImage;
      if (!existing) {
        const cx = (UI_W - sw) / 2;
        const cy = (UI_H - sh) / 2;
        pendingPosRef.current = { x: cx, y: cy };
        requestFlush();
      }
    };
    img.src = image;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  // Handlers (attached to the overlay that captures the pointer)
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    lastPtRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !lastPtRef.current) return;
    const dx = e.clientX - lastPtRef.current.x;
    const dy = e.clientY - lastPtRef.current.y;
    lastPtRef.current = { x: e.clientX, y: e.clientY };
    pendingPosRef.current = { x: pos.x + dx, y: pos.y + dy };
    requestFlush();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    draggingRef.current = false;
    setDragging(false);
    lastPtRef.current = null;
  };

  // Wheel zoom (zoom to cursor) — attach to same overlay
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0015);
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const oldScale = scale;
    const newScale = clamp(oldScale * factor, 0.15, 6);

    const imgX = (mx - pos.x) / oldScale;
    const imgY = (my - pos.y) / oldScale;

    const newX = mx - imgX * newScale;
    const newY = my - imgY * newScale;

    pendingScaleRef.current = newScale;
    pendingPosRef.current = { x: newX, y: newY };
    requestFlush();
  };

  const handleSave = () => {
    onSave({
      src: image,
      x: pos.x / UI_SCALE,
      y: pos.y / UI_SCALE,
      scale: scale / UI_SCALE,
    });
  };

  const clipId = useMemo(() => `imgpos-clip-${template.id}`, [template.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] no-select">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Position {type === "background" ? "Background" : "Logo"} Image
        </h3>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Zoom: {(scale / UI_SCALE).toFixed(2)}x
          </label>
          <input
            type="range"
            min={0.15}
            max={6}
            step={0.01}
            value={scale}
            onChange={(e) => {
              const newScale = parseFloat(e.target.value);
              pendingScaleRef.current = newScale;
              requestFlush();
            }}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Use mouse wheel to zoom towards the cursor. Drag the image to reposition.
          </p>
        </div>

        <div
          className="relative mx-auto border border-gray-300 bg-white"
          style={{ width: UI_W, height: UI_H }}
        >
          {/* Visible stencil with clip-path */}
          <svg
            width={UI_W}
            height={UI_H}
            className="absolute inset-0"
            style={{ pointerEvents: "none" }}
          >
            <defs>
              <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                {template.mask?.type === "oval" ? (
                  <ellipse cx={UI_W / 2} cy={UI_H / 2} rx={UI_W / 2} ry={UI_H / 2} />
                ) : (
                  <rect
                    x={0}
                    y={0}
                    width={UI_W}
                    height={UI_H}
                    rx={(template.mask?.rx ?? 4) * UI_SCALE}
                    ry={(template.mask?.ry ?? 4) * UI_SCALE}
                  />
                )}
              </clipPath>
            </defs>

            {/* Stencil outline */}
            <g style={{ pointerEvents: "none" }}>
              {template.mask?.type === "oval" ? (
                <ellipse
                  cx={UI_W / 2}
                  cy={UI_H / 2}
                  rx={UI_W / 2}
                  ry={UI_H / 2}
                  fill={backgroundColor}
                  stroke="#3b82f6"
                  strokeWidth="4"
                />
              ) : (
                <rect
                  x={0}
                  y={0}
                  width={UI_W}
                  height={UI_H}
                  rx={(template.mask?.rx ?? 4) * UI_SCALE}
                  ry={(template.mask?.ry ?? 4) * UI_SCALE}
                  fill={backgroundColor}
                  stroke="#3b82f6"
                  strokeWidth="4"
                />
              )}
            </g>
          </svg>

          {/* Draggable, clipped image + overlay that owns ALL events */}
          <div
            ref={overlayRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `url(#${clipId})`,
              WebkitClipPath: `url(#${clipId})`,
              overflow: "hidden",
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
          >
            <img
              ref={imgRef}
              src={image}
              alt={type}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                willChange: "transform,left,top",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Position
          </button>
        </div>
      </div>
    </div>
  );
};

export { ImagePositioning };
export default ImagePositioning;