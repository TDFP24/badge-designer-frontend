import React, { useState } from "react";
import { Badge, BadgeImage } from "../types/badge";
import ImagePositioning from "./ImagePositioning";

type Props = {
  badge: Badge;
  onChange: (b: Badge) => void;
};

export const ImageControls: React.FC<Props> = ({ badge, onChange }) => {
  const [showPositioning, setShowPositioning] = useState(false);
  const [positioningType, setPositioningType] = useState<"background" | "logo">("background");
  const [positioningImage, setPositioningImage] = useState<string>("");

  const openPositioner = (type: "background" | "logo", src: string) => {
    setPositioningType(type);
    setPositioningImage(src);
    setShowPositioning(true);
  };

  const handleFile = (file: File, type: "background" | "logo") => {
    console.log("[ImageControls] file selected", { type, name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      console.log("[ImageControls] opening ImagePositioning modal", { type });
      openPositioner(type, src);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: "background" | "logo") => {
    if (type === "background") onChange({ ...badge, backgroundImage: undefined });
    else onChange({ ...badge, logo: undefined });
  };

  const onSavePositioned = (img: BadgeImage | string) => {
    if (typeof img === "string") {
      setShowPositioning(false);
      return;
    }
    if (positioningType === "background") onChange({ ...badge, backgroundImage: img });
    else onChange({ ...badge, logo: img });
    setShowPositioning(false);
    setPositioningImage("");
  };

  const getBadgeBackgroundForLogoPreview = () => {
    if (badge.backgroundImage) {
      return typeof badge.backgroundImage === "string"
        ? `url(${badge.backgroundImage})`
        : `url(${badge.backgroundImage.src})`;
    }
    return badge.backgroundColor;
  };

  return (
    <div className="space-y-4">
      {/* Background image */}
      <div className="border-l-4 border-blue-500 pl-3">
        <h3 className="font-semibold text-gray-700 mb-2">Background Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f, "background");
          }}
          className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {badge.backgroundImage && (
          <div className="flex gap-2 mt-2">
            <button
              className="px-2 py-1 text-xs border rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={() => {
                const src = typeof badge.backgroundImage === "string" ? badge.backgroundImage : badge.backgroundImage.src;
                openPositioner("background", src);
              }}
            >
              Reposition
            </button>
            <button
              className="px-2 py-1 text-xs border rounded bg-red-50 text-red-700 hover:bg-red-100"
              onClick={() => removeImage("background")}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="border-l-4 border-green-500 pl-3">
        <h3 className="font-semibold text-gray-700 mb-2">Logo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f, "logo");
          }}
          className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        {badge.logo && (
          <div className="flex gap-2 mt-2">
            <button
              className="px-2 py-1 text-xs border rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={() => openPositioner("logo", badge.logo!.src)}
            >
              Reposition
            </button>
            <button
              className="px-2 py-1 text-xs border rounded bg-red-50 text-red-700 hover:bg-red-100"
              onClick={() => removeImage("logo")}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Positioning modal */}
      {showPositioning && (
        <ImagePositioning
          image={positioningImage}
          type={positioningType}
          onSave={onSavePositioned}
          onCancel={() => { console.log("[ImageControls] close modal"); setShowPositioning(false); }}
          templateId={badge.templateId}
          badgeLogo={badge.logo}
          badgeBackgroundImage={
            typeof badge.backgroundImage !== "string" ? badge.backgroundImage : undefined
          }
          backgroundColor={badge.backgroundColor}
        />
      )}
    </div>
  );
};


