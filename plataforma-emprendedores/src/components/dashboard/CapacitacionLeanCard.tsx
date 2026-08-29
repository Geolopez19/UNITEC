import React from 'react';

interface CapacitacionLeanCardProps {
  title?: string;
  description?: string;
  videoThumbnail?: string;
}

export const CapacitacionLeanCard: React.FC<CapacitacionLeanCardProps> = ({
  title = 'Capacitación Lean Recomendada',
  description = 'Aprende a optimizar tus procesos y reducir costos con esta metodología ágil de 15 minutos.',
  videoThumbnail = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
}) => {
  return (
    <div className="md:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-level-1 flex flex-col md:flex-row gap-6 items-center">
      <div className="w-full md:w-1/2 relative rounded-lg overflow-hidden shadow-sm group cursor-pointer aspect-video md:aspect-auto h-full min-h-[140px]">
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${videoThumbnail})` }}
        ></div>
        <div className="absolute inset-0 bg-on-background/30 flex items-center justify-center group-hover:bg-on-background/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              play_arrow
            </span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <span className="text-tertiary font-semibold text-xs mb-2 flex items-center gap-1 uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm">school</span>
          Recomendado para ti
        </span>
        <h4 className="font-headline text-lg font-semibold text-on-surface mb-2 leading-tight">
          {title}
        </h4>
        <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>
        <button className="text-primary hover:text-on-primary-fixed-variant font-semibold text-xs flex items-center gap-1 transition-colors self-start cursor-pointer">
          Ver video completo
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
