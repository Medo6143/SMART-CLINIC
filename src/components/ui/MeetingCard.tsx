import React from 'react';
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MeetingCardProps {
  url: string;
  isSentByMe: boolean;
  isRtl: boolean;
}

export function MeetingCard({ url, isSentByMe, isRtl }: MeetingCardProps) {
  const isGoogleMeet = url.includes('meet.google.com');
  const isZoom = url.includes('zoom.us');
  
  const platformName = isGoogleMeet ? 'Google Meet' : isZoom ? 'Zoom' : 'Video Call';
  const platformColor = isGoogleMeet ? 'bg-[#00897B]' : isZoom ? 'bg-[#2D8CFF]' : 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "max-w-sm rounded-[32px] overflow-hidden shadow-2xl border backdrop-blur-xl transition-all hover:scale-[1.02]",
        isSentByMe 
          ? "bg-primary/90 text-white border-white/20 shadow-primary/30" 
          : "bg-white/90 text-on-surface border-outline-variant/10 shadow-black/5"
      )}
    >
      <div className={cn("p-6 flex items-center gap-4", platformColor)}>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
          <Video className="text-white" size={24} />
        </div>
        <div>
          <h4 className="font-black text-white uppercase tracking-tighter text-lg leading-none mb-1">
            {isRtl ? 'استشارة مرئية' : 'Video Consultation'}
          </h4>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            {platformName}
          </p>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-2">
            <div className={cn(
                "flex items-center gap-3 text-xs font-bold",
                isSentByMe ? "text-white/80" : "text-on-surface/60"
            )}>
                <Calendar size={14} />
                <span>{new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div className={cn(
                "flex items-center gap-3 text-xs font-bold",
                isSentByMe ? "text-white/80" : "text-on-surface/60"
            )}>
                <Clock size={14} />
                <span>Starts in 5 minutes</span>
            </div>
        </div>

        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg",
            isSentByMe 
              ? "bg-white text-primary hover:bg-white/90 shadow-white/10" 
              : "bg-primary text-white hover:bg-primary-container shadow-primary/20"
          )}
        >
          {isRtl ? 'انضم الآن' : 'Join Now'}
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  );
}
