import React, { useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string | null;
  title: string;
  durationMinutes?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, durationMinutes = 10 }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center p-8 text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl">videocam_off</span>
        </div>
        <div>
          <h4 className="font-headline font-bold text-on-surface text-base">Clase 100% Teórica</h4>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1">
            Esta lección está enfocada en lectura guiada y ejercicios prácticos. Consulta la guía teórica a continuación.
          </p>
        </div>
      </div>
    );
  }

  // Extract YouTube ID if applicable
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-level-2 border border-outline-variant/20 relative group">
      {!isPlaying ? (
        <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-slate-950/60 p-6">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-md">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 rounded-full bg-primary text-on-primary shadow-level-2 flex items-center justify-center group-hover:scale-110 transition-all cursor-pointer ring-4 ring-primary/20"
              aria-label="Reproducir Video"
            >
              <span className="material-symbols-outlined text-4xl translate-x-0.5">play_arrow</span>
            </button>

            <div>
              <span className="px-3 py-1 bg-surface-container-lowest/80 backdrop-blur-md rounded-full text-[11px] font-semibold text-primary border border-outline-variant/30 mb-2 inline-block">
                Clase Audiovisual • {durationMinutes} min
              </span>
              <h3 className="font-headline text-lg font-bold text-white leading-snug drop-shadow-sm">
                {title}
              </h3>
            </div>
          </div>
        </div>
      ) : (
        <iframe
          className="w-full h-full"
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
};
