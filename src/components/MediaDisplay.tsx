// MediaDisplay.tsx

import React, { useState } from "react";

interface MediaDisplayProps {
  media: string[];
  mediaType?: "image" | "video";
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media, mediaType }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (media.length === 0) {
    return null; // No media to display
  }

  return (
    <div className="mb-12">
      {mediaType === "image" && (
        <div className="relative aspect-[16/9] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {media.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Slide ${index + 1}`}
                className="absolute w-full h-full object-contain transition-all duration-500 ease-in-out"
                style={{
                  opacity: currentSlide === index ? 1 : 0,
                  transform: currentSlide === index ? "scale(1)" : "scale(0.95)",
                }}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0 ? media.length - 1 : prev - 1
                )
              }
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
            >
              ←
            </button>
            <button
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === media.length - 1 ? 0 : prev + 1
                )
              }
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
            >
              →
            </button>
          </div>

          {/* Slide Counter */}
          <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white/80">
            {currentSlide + 1} / {media.length}
          </div>
        </div>
      )}

      {mediaType === "video" && (
        <div className="relative aspect-[16/9] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden">
          <video
            src={media[0]}
            controls
            className="absolute w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;