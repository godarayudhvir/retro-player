import React from 'react';
import { 
  Trophy, 
  PlayCircle, 
  Gamepad2, 
  Layers, 
  Globe, 
  Navigation, 
  FolderHeart, 
  Database, 
  Flame, 
  Timer, 
  Zap, 
  Award, 
  Heart, 
  Moon, 
  Sun, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  Shuffle, 
  Eye, 
  Activity, 
  FastForward, 
  PauseCircle, 
  Save, 
  RotateCcw, 
  Repeat, 
  DownloadCloud, 
  UploadCloud, 
  GitBranch, 
  UserCheck, 
  SunMoon, 
  Tv, 
  Music, 
  Star, 
  Gamepad, 
  Camera, 
  Video, 
  ShieldCheck, 
  BookOpen, 
  Image,
  X
} from 'lucide-react';
import { ACHIEVEMENT_TIERS } from '../data/achievementsManifest';

const ICON_MAP = {
  PlayCircle,
  Gamepad2,
  Layers,
  Globe,
  Navigation,
  FolderHeart,
  Database,
  Flame,
  Timer,
  Zap,
  Award,
  Heart,
  Moon,
  Sun,
  Calendar,
  Sparkles,
  AlertTriangle,
  Shuffle,
  Eye,
  Activity,
  FastForward,
  PauseCircle,
  Save,
  RotateCcw,
  Repeat,
  DownloadCloud,
  UploadCloud,
  GitBranch,
  UserCheck,
  SunMoon,
  Tv,
  Music,
  Star,
  Gamepad,
  Camera,
  Video,
  ShieldCheck,
  BookOpen,
  Image,
  Trophy
};

export default function AchievementToast({ toast, onDismiss, onOpenCabinet }) {
  if (!toast) return null;

  console.log('🍞 [TOAST RENDER] Displaying AchievementToast HUD:', toast.title, `(+${toast.tier} tier)`);

  const tier = ACHIEVEMENT_TIERS[toast.tier?.toUpperCase()] || ACHIEVEMENT_TIERS.BRONZE;
  const IconComponent = ICON_MAP[toast.icon] || Trophy;

  return (
    <div 
      className={`achievement-toast-container tier-${toast.tier || 'bronze'} animate-toast-slide`}
      onClick={() => {
        if (onOpenCabinet) onOpenCabinet();
        if (onDismiss) onDismiss();
      }}
      role="status"
      aria-live="polite"
      title="Click to open Trophy Cabinet"
    >
      <div className="achievement-toast-ds-card">
        {/* Glowing Tier Badge Icon Box */}
        <div 
          className="achievement-toast-icon-box" 
          style={{ background: tier.bg, color: tier.color, borderColor: tier.border }}
        >
          <IconComponent size={22} strokeWidth={2.4} />
        </div>

        {/* Content Details */}
        <div className="achievement-toast-body">
          <div className="achievement-toast-top-row">
            <span className="achievement-toast-kicker" style={{ color: tier.color }}>
              <Trophy size={11} style={{ marginRight: '3px' }} />
              ACHIEVEMENT UNLOCKED
            </span>
            <span className="achievement-toast-points-badge" style={{ background: tier.bg, color: tier.color, borderColor: tier.border }}>
              +{tier.points}G
            </span>
          </div>

          <strong className="achievement-toast-title">{toast.title}</strong>
          <p className="achievement-toast-desc">{toast.description}</p>
        </div>

        {/* Dismiss Button */}
        <button 
          type="button" 
          className="achievement-toast-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onDismiss) onDismiss();
          }}
          aria-label="Dismiss Achievement Notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
