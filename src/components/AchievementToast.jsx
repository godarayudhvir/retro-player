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
  X,
  Compass,
  Map,
  PlusCircle,
  Anchor,
  Users,
  Bike,
  Search,
  Volume2,
  Share2,
  Feather,
  Waves,
  Disc,
  Crown,
  HelpCircle,
  Pocket,
  Clock,
  Sliders,
  DoorOpen,
  Coffee,
  Dices,
  Copy,
  History
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
  Trophy,
  Compass,
  Map,
  PlusCircle,
  Anchor,
  Users,
  Bike,
  Search,
  Volume2,
  Share2,
  Feather,
  Waves,
  Disc,
  Crown,
  HelpCircle,
  Pocket,
  Clock,
  Sliders,
  DoorOpen,
  Coffee,
  Dices,
  Copy,
  History
};

export default function AchievementToast({ toast, onDismiss, onOpenCabinet }) {
  if (!toast) return null;

  const isPokemon = toast.category === 'pokemon' || toast.id?.startsWith('poke_') || Boolean(toast.isPerRom);
  console.log(`🍞 [TOAST RENDER] Displaying ${isPokemon ? 'Pokémon Milestone' : 'Achievement'} Toast:`, toast.title, `(+${toast.tier} tier)`);

  const tier = ACHIEVEMENT_TIERS[toast.tier?.toUpperCase()] || ACHIEVEMENT_TIERS.BRONZE;
  const IconComponent = ICON_MAP[toast.icon] || (isPokemon ? Award : Trophy);

  const handleToastClick = () => {
    if (!isPokemon && onOpenCabinet) {
      onOpenCabinet();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div 
      className={`achievement-toast-container tier-${toast.tier || 'bronze'} ${isPokemon ? 'is-pokemon-milestone' : 'is-trophy-achievement'} animate-toast-slide`}
      onClick={handleToastClick}
      role="status"
      aria-live="polite"
      title={isPokemon ? `${toast.title} (Pokémon Milestone)` : "Click to open Trophy Cabinet"}
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
              {isPokemon ? (
                <>
                  <Award size={11} style={{ marginRight: '3px' }} />
                  POKÉMON MILESTONE
                </>
              ) : (
                <>
                  <Trophy size={11} style={{ marginRight: '3px' }} />
                  ACHIEVEMENT UNLOCKED
                </>
              )}
            </span>
            <span className="achievement-toast-points-badge" style={{ background: tier.bg, color: tier.color, borderColor: tier.border }}>
              {isPokemon ? (toast.tier ? toast.tier.toUpperCase() : 'TRAINER') : `+${tier.points}G`}
            </span>
          </div>

          <strong className="achievement-toast-title">{toast.title}</strong>
        </div>

        {/* Dismiss Button */}
        <button 
          type="button" 
          className="achievement-toast-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onDismiss) onDismiss();
          }}
          aria-label={isPokemon ? "Dismiss Milestone Notification" : "Dismiss Achievement Notification"}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
