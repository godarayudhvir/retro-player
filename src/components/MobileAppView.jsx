import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Play,
  Star,
  Pencil,
  RefreshCw,
  Clock,
  History,
  Calendar,
  Cpu,
  Tag,
  Save,
  CheckCircle2,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  BookOpen,
  Tv,
  ExternalLink,
  Smartphone,
  Globe,
  Check,
  ArrowLeft,
  Sparkles,
  Image,
  FileText,
  Search,
  FolderOpen,
  Gamepad2,
  Layers,
  Volume2,
  VolumeX,
  Palette,
  X,
  Menu,
  Plus,
  ChevronRight,
  Music,
  SkipBack,
  SkipForward,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Square,
  Edit3,
  Info,
  Database,
  Users,
  Zap,
  Trophy,
  Settings,
  Shield,
  Award,
  Crown,
  Lock,
  Bike,
  Anchor,
  Waves,
  Share2,
  Map as MapIcon,
  Disc,
  Feather,
  DollarSign,
  AlertCircle,
  PlusCircle,
  Eye,
  Activity,
  Compass,
  Sun,
  Moon
} from 'lucide-react';
import QRCode from 'qrcode';
import MultiAvatar from './MultiAvatar';
import ConfirmModal from './ConfirmModal';
import { resolveAssetPath } from '../utils/assetPath';
import { getReleaseDate, getGameDescription } from '../gameDescriptions';
import { saveCachedMetadata } from '../services/metadataScraper';
import { ACHIEVEMENT_TIERS } from '../data/achievementsManifest';
import { getPokemonBadgesForGame, getPokemonKantoBadgesForGame, getPokemonMilestonesForGame, isJohtoPokemonGame } from '../services/pokemon-save-inspector/index.js';
import { isPokemonRom } from '../services/pokemonSaveParser';
import { haptics } from '../services/hapticsService';

function isPokemonMilestoneEarned(unlocked, milestoneId, game) {
  if (!unlocked || !milestoneId || !game) return false;
  const gId = game.id;
  const gTitle = game.title;
  if (gId && unlocked[`${milestoneId}__${gId}`]) return true;
  if (gTitle && unlocked[`${milestoneId}__${gTitle}`]) return true;
  const legacy = unlocked[milestoneId];
  if (legacy && (legacy.gameId === gId || legacy.gameTitle === gTitle)) return true;
  return false;
}

const POKE_ICON_MAP = {
  Compass,
  Bike,
  Anchor,
  Waves,
  Search,
  Volume2,
  Eye,
  Share2,
  Map: MapIcon,
  Disc,
  Shield,
  Award,
  Trophy,
  PlusCircle,
  Zap,
  Users,
  Crown,
  Star,
  Feather,
  Activity,
  DollarSign,
  AlertCircle,
  BookOpen
};

function PokeballIcon({ size = 18, isActive = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        flexShrink: 0,
        transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <path d="M2.05 12a10 10 0 0 0 19.9 0H15a3 3 0 0 1-6 0H2.05z" fill="#ffffff" />
      <path d="M2.05 12a10 10 0 0 1 19.9 0H15a3 3 0 0 0-6 0H2.05z" fill="#ef4444" />
      <circle cx="12" cy="12" r="10" stroke="#1e293b" strokeWidth="1.8" fill="none" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="#1e293b" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.8" />
      <circle cx="12" cy="1.5" fill="#1e293b" />
    </svg>
  );
}
import { convertRemoteImageToWebpDataUrl } from '../utils/imageConverter';
import { resetEntireApp } from '../utils/appReset';

/**
 * MobileAppView: Authentic Nintendo DS Touch Theme Mobile Experience.
 * 
 * 5 Seamless Stages with 100% Desktop Parity:
 * - Stage 1: Choose Profile ("Who's Playing?" Multiavatar profile selector)
 * - Stage 2: Choose System (DS Console Cards with authentic console SVGs, total titles, categories)
 * - Stage 3: Choose Game (3-Column square beveled DS touch buttons matrix)
 * - Stage 4: Shows Game Detail (DS Dual-Screen layout with Cover Top Screen, Synopsis Bottom Screen,
 *            Big Nintendo Play Button, and integrated Direct Touch tabs for Favorite, Save RAM Studio,
 *            Strategy Guides QR Companion, Metadata Editor, and Online Scraper Studio)
 * - Stage 5: Plays Game (Launches full emulation sandbox with responsive mobile touch controls)
 */
export default function MobileAppView({
  games = [],
  systems = [],
  activeProfile,
  profiles = [],
  activeProfileId,
  onSelectProfile,
  onCreateNewProfile,
  onEditProfile,
  onDeleteProfile,
  favorites = [],
  recentlyPlayed = [],
  isFavorite,
  toggleFavorite,
  getGameStats,
  onPlayGame,
  metadataMap = {},
  onCustomRomLoad,
  sfx,
  focusedTarget = { zone: 'mobileSystems', index: 0 },
  setFocusedTarget,
  selectedGameForDetails,
  setSelectedGameForDetails,
  hasChosenProfileThisSession,
  setHasChosenProfileThisSession,
  showProfileSwitcher,
  setShowProfileSwitcher,
  selectedSystem,
  setSelectedSystem,
  searchQuery = '',
  setSearchQuery,
  bgm,
  themeEngine,
  onEditMetadata,
  onScrapeGame,
  onExportSave,
  onExportBatterySave,
  onExportQuickSave,
  onImportSave,
  onDeleteSave,
  checkSaveData,
  onDeleteGame,
  onResetStats,
  hasSaveData,
  scraper,
  pwa,
  gamepadConnected = false,
  gamepadBattery,
  time,
  onOpenScraperModal,
  onOpenAboutModal,
  onOpenBackupModal,
  onOpenTrophyModal,
  setShowLoadRomModal,
  setShowVirtualKeyboard,
  getBatterySaveBuffer,
  achievementsEngine
}) {
  const fileInputRef = useRef(null);
  const saveFileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  // Auto-inspect & evaluate existing Pokémon save buffer when viewing game details
  useEffect(() => {
    if (selectedGameForDetails && isPokemonRom(selectedGameForDetails) && getBatterySaveBuffer && achievementsEngine?.evaluatePokemonSave) {
      getBatterySaveBuffer(selectedGameForDetails, activeProfileId).then(u8 => {
        if (u8) achievementsEngine.evaluatePokemonSave(selectedGameForDetails, u8);
      }).catch(() => {});
    }
  }, [selectedGameForDetails, activeProfileId, getBatterySaveBuffer, achievementsEngine]);
  const sidecarInputRef = useRef(null);
  const logsEndRef = useRef(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const [showDeleteSaveConfirm, setShowDeleteSaveConfirm] = useState(false);
  const [showDeleteGameConfirm, setShowDeleteGameConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveActionStatus, setSaveActionStatus] = useState('');

  // Setting: Auto-Resume on Game Launch
  const [isAutoResumeEnabled, setIsAutoResumeEnabled] = useState(() => {
    try {
      return localStorage.getItem('retro_auto_resume_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Setting: Haptic Touch & Tactile Feedback
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(() => haptics.isEnabled);

  // DS Detail Tabs: 'overview' | 'save' | 'guides' | 'manage'
  const [dsTab, setDsTab] = useState('overview');
  const [isLocalScraping, setIsLocalScraping] = useState(false);

  // Reset save action toast when switching selected game
  useEffect(() => {
    setSaveActionStatus('');
  }, [selectedGameForDetails?.id]);

  // Strategy Guides QR Companion State
  const [activeQrType, setActiveQrType] = useState(null); // 'written' | 'video' | null
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Metadata Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editDeveloper, setEditDeveloper] = useState('');
  const [editPublisher, setEditPublisher] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWrittenGuide, setEditWrittenGuide] = useState('');
  const [editVideoGuide, setEditVideoGuide] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editSaveStatus, setEditSaveStatus] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Listen for bottom nav tab transitions from child views (e.g. Trophies)
  useEffect(() => {
    const handleNavEvent = (e) => {
      const tab = e.detail;
      if (tab === 'favorites') {
        setSelectedSystem({ key: 'favorites', name: 'Favorites', icon: null });
      } else if (tab === 'recent') {
        setSelectedSystem({ key: 'recent', name: 'Recently Played', icon: null });
      } else if (tab === 'library') {
        setSelectedSystem({ key: 'all', name: 'All Games', icon: 'assets/platforms/gba.svg' });
      } else if (tab === 'tools') {
        setIsHamburgerOpen(true);
      }
    };
    window.addEventListener('retro_nav_tab', handleNavEvent);
    return () => window.removeEventListener('retro_nav_tab', handleNavEvent);
  }, []);

  // Group games by platform / system
  const systemGamesMap = useMemo(() => {
    const map = {};
    games.forEach(g => {
      if (!g.systemKey) return;
      if (!map[g.systemKey]) map[g.systemKey] = [];
      map[g.systemKey].push(g);
    });
    return map;
  }, [games]);

  // Favorite games list
  const favoriteGames = useMemo(() => {
    return games.filter(g => favorites.includes(g.id || g.title));
  }, [games, favorites]);

  // Recently played games list
  const recentGames = useMemo(() => {
    const recentIds = recentlyPlayed.map(r => r.id || r.title);
    return games
      .filter(g => recentIds.includes(g.id || g.title))
      .sort((a, b) => {
        const idxA = recentIds.indexOf(a.id || a.title);
        const idxB = recentIds.indexOf(b.id || b.title);
        return idxA - idxB;
      });
  }, [games, recentlyPlayed]);

  // Filtered games for current view
  const currentGamesList = useMemo(() => {
    let baseList = [];
    if (selectedSystem) {
      if (selectedSystem.key === 'favorites') {
        baseList = favoriteGames;
      } else if (selectedSystem.key === 'recent') {
        baseList = recentGames;
      } else if (selectedSystem.key === 'all') {
        baseList = games;
      } else {
        baseList = systemGamesMap[selectedSystem.key] || [];
      }
    } else {
      baseList = games;
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return baseList.filter(g =>
        g.title.toLowerCase().includes(q) ||
        (g.systemName && g.systemName.toLowerCase().includes(q))
      );
    }

    return baseList;
  }, [selectedSystem, searchQuery, games, favoriteGames, recentGames, systemGamesMap]);

  // Selected game metadata details
  const selectedMeta = selectedGameForDetails
    ? (metadataMap[selectedGameForDetails.id] || metadataMap[`${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')])
    : null;
  const selectedStats = selectedGameForDetails && getGameStats ? getGameStats(selectedGameForDetails.id || selectedGameForDetails.title) : null;
  const isSelectedFav = selectedGameForDetails && isFavorite ? isFavorite(selectedGameForDetails.id || selectedGameForDetails.title) : false;

  const rawCover = (dsTab === 'manage' && editCoverUrl) ? editCoverUrl : (selectedMeta?.coverUrl || (selectedGameForDetails?.coverUrl && !selectedGameForDetails?.coverUrl.endsWith('.svg') ? selectedGameForDetails.coverUrl : null));
  const coverSrc = rawCover ? resolveAssetPath(rawCover) : null;
  const rawScreenshot = selectedMeta?.screenshotUrl;
  const screenshotSrc = rawScreenshot ? resolveAssetPath(rawScreenshot) : null;
  const description = (selectedGameForDetails?.sidecarMetadata && selectedGameForDetails.sidecarMetadata.description !== undefined)
    ? selectedGameForDetails.sidecarMetadata.description
    : (selectedMeta?.description !== undefined ? selectedMeta.description : (selectedGameForDetails ? getGameDescription(selectedGameForDetails) : ''));

  const releaseYear = selectedGameForDetails?.sidecarMetadata?.releaseYear ||
    (selectedGameForDetails?.sidecarMetadata?.releaseDate ? selectedGameForDetails.sidecarMetadata.releaseDate.split('-')[0] : null) ||
    selectedMeta?.releaseYear ||
    selectedMeta?.releaseDate?.split('-')[0] ||
    (selectedGameForDetails && getReleaseDate(selectedGameForDetails) !== '2000-01-01' ? getReleaseDate(selectedGameForDetails).split('-')[0] : null);

  const rawDeveloper = selectedGameForDetails?.sidecarMetadata?.developer || selectedMeta?.developer || null;
  const rawPublisher = selectedGameForDetails?.sidecarMetadata?.publisher || selectedMeta?.publisher || null;
  const rawGenre = selectedGameForDetails?.sidecarMetadata?.genre || selectedMeta?.genre || null;

  const isDummyName = (str) => !str || str === 'Classic' || str === selectedGameForDetails?.systemName || str === selectedGameForDetails?.systemKey || str === 'Game Boy' || str === 'Game Boy Advance' || str === 'Game Boy Color' || str === 'Nintendo DS' || str === 'Super Nintendo' || str === 'Nintendo (NES)' || str === 'Nintendo 64' || str === 'Sega Genesis' || str === 'Sega Game Gear' || str === 'Sony PlayStation' || str === 'Arcade' || str === 'Atari 2600';
  const developer = isDummyName(rawDeveloper) ? null : rawDeveloper;
  const publisher = isDummyName(rawPublisher) ? null : rawPublisher;
  const genre = (!rawGenre || rawGenre === 'Retro Classic') ? null : rawGenre;

  const walkthrough = selectedGameForDetails?.sidecarMetadata?.walkthrough || selectedMeta?.walkthrough || {};
  const writtenGuideUrl = walkthrough.written || selectedMeta?.writtenWalkthroughUrl || null;
  const videoGuideUrl = walkthrough.video || selectedMeta?.videoWalkthroughUrl || null;
  const hasGuides = Boolean(writtenGuideUrl || videoGuideUrl);

  const checkSaveDataRef = useRef(checkSaveData);
  useEffect(() => {
    checkSaveDataRef.current = checkSaveData;
  }, [checkSaveData]);

  // Reset tab only on switching to a different game and check save presence
  const activeGameKey = selectedGameForDetails ? (selectedGameForDetails.id || selectedGameForDetails.title) : null;
  useEffect(() => {
    if (activeGameKey && selectedGameForDetails) {
      setDsTab('overview');
      setActiveQrType(null);
      setQrDataUrl('');
      setCopiedLink(false);
      setEditSaveStatus('');
      checkSaveDataRef.current?.(selectedGameForDetails);
    }
  }, [activeGameKey]);

  // Synchronize form fields with active selected game
  useEffect(() => {
    if (!selectedGameForDetails) return;
    setEditTitle(selectedMeta?.title || selectedGameForDetails.title || '');
    setEditYear(selectedMeta?.releaseYear || (releaseYear !== 'Classic' ? releaseYear : ''));
    setEditGenre(selectedMeta?.genre || (genre !== 'Retro Classic' ? genre : ''));
    setEditDeveloper(selectedMeta?.developer || developer || '');
    setEditPublisher(selectedMeta?.publisher || publisher || '');
    setEditDescription(selectedMeta?.description || description || '');
    setEditWrittenGuide(walkthrough.written || selectedMeta?.writtenWalkthroughUrl || '');
    setEditVideoGuide(walkthrough.video || selectedMeta?.videoWalkthroughUrl || '');
    setEditCoverUrl(selectedMeta?.coverUrl || (selectedGameForDetails.coverUrl && !selectedGameForDetails.coverUrl.endsWith('.svg') ? selectedGameForDetails.coverUrl : ''));
  }, [selectedGameForDetails?.id, selectedGameForDetails?.title, selectedMeta, releaseYear, genre, developer, publisher, description]);

  // Handle custom ROM file upload
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onCustomRomLoad) {
      onCustomRomLoad(file);
      sfx?.playGameLaunch?.();
    }
  };

  // Manual re-scrape handler
  const handleManualScrape = async () => {
    if (!selectedGameForDetails) return;
    setIsLocalScraping(true);
    sfx?.playThemeSwitch?.();
    let result = null;
    if (onScrapeGame) {
      result = await onScrapeGame(selectedGameForDetails, true);
    } else if (scraper?.scrapeSingleGame) {
      result = await scraper.scrapeSingleGame(selectedGameForDetails, true);
    }
    if (result) {
      setEditTitle(result.title || selectedGameForDetails.title);
      setEditYear(result.releaseYear || 'Classic');
      setEditGenre(result.genre || 'Retro Classic');
      setEditDeveloper(result.developer || 'Classic');
      setEditPublisher(result.publisher || 'Classic');
      setEditDescription(result.description || '');
      if (result.coverUrl) {
        setEditCoverUrl(result.coverUrl);
      }
    }
    setIsLocalScraping(false);
  };

  // Save metadata edit handler
  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!selectedGameForDetails || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      const id = selectedGameForDetails.id || `${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let finalCoverUrl = editCoverUrl.trim() || null;
      let diskSaved = false;

      const walkthroughObj = (editWrittenGuide.trim() || editVideoGuide.trim()) ? {
        ...(editWrittenGuide.trim() ? { written: editWrittenGuide.trim() } : {}),
        ...(editVideoGuide.trim() ? { video: editVideoGuide.trim() } : {})
      } : undefined;

      // Convert remote URLs to WebP Data URL for disk persistence
      let payloadCoverDataUrl = editCoverUrl.startsWith('data:image/') ? editCoverUrl : null;
      if (!payloadCoverDataUrl && editCoverUrl && (editCoverUrl.startsWith('http://') || editCoverUrl.startsWith('https://'))) {
        try {
          const converted = await convertRemoteImageToWebpDataUrl(editCoverUrl);
          if (converted && converted.startsWith('data:image/')) {
            payloadCoverDataUrl = converted;
          }
        } catch (_) { }
      }

      // Try saving directly to disk backend via /api/metadata/save-sidecar
      try {
        const res = await fetch('/api/metadata/save-sidecar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: id,
            systemKey: selectedGameForDetails.systemKey,
            romPath: selectedGameForDetails.romUrl || selectedGameForDetails.url,
            title: editTitle.trim() || selectedGameForDetails.title,
            description: editDescription.trim(),
            releaseYear: editYear.trim(),
            developer: editDeveloper.trim() || selectedGameForDetails.systemName,
            publisher: editPublisher.trim() || selectedGameForDetails.systemName,
            genre: editGenre.trim() || 'Retro Classic',
            walkthrough: walkthroughObj,
            coverDataUrl: payloadCoverDataUrl,
            coverUrl: !payloadCoverDataUrl ? editCoverUrl : null
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            diskSaved = true;
            if (result.savedCoverUrl) {
              finalCoverUrl = result.savedCoverUrl;
            }
          }
        }
      } catch (backendErr) {
        console.warn('Backend disk write unavailable, saving to IndexedDB:', backendErr);
      }

      const updatedData = {
        id,
        title: editTitle.trim() || selectedGameForDetails.title,
        systemKey: selectedGameForDetails.systemKey,
        releaseYear: editYear.trim() || 'Classic',
        releaseDate: editYear.trim() ? `${editYear.trim()}-01-01` : '2000-01-01',
        genre: editGenre.trim() || 'Retro Classic',
        developer: editDeveloper.trim() || selectedGameForDetails.systemName || 'Classic',
        publisher: editPublisher.trim() || selectedGameForDetails.systemName || 'Classic',
        description: editDescription.trim() || `Experience ${selectedGameForDetails.title} on ${selectedGameForDetails.systemName}.`,
        coverUrl: finalCoverUrl,
        hasCustomCover: Boolean(finalCoverUrl),
        walkthrough: walkthroughObj,
        writtenWalkthroughUrl: editWrittenGuide.trim() || undefined,
        videoWalkthroughUrl: editVideoGuide.trim() || undefined,
        isManualOverride: true,
        source: diskSaved ? 'Local Sidecar (Disk)' : 'Manual Edit',
        scrapedAt: new Date().toISOString()
      };

      await saveCachedMetadata(id, updatedData);
      scraper?.updateLocalMetadata?.(id, updatedData);
      sfx?.playMenuConfirm?.();
      setEditSaveStatus(diskSaved ? 'Saved to Server Disk & Sidecar!' : 'Saved to Browser Storage!');
      setTimeout(() => {
        setEditSaveStatus('');
        setDsTab('overview');
      }, 1100);
    } catch (err) {
      console.error('Failed to save metadata:', err);
      setEditSaveStatus('Save Failed');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Export metadata.json sidecar handler
  const handleExportSidecar = () => {
    if (!selectedGameForDetails) return;
    const sidecarData = {
      title: editTitle.trim() || selectedGameForDetails.title,
      releaseYear: editYear.trim() || (releaseYear !== 'Classic' ? releaseYear : '2000'),
      genre: editGenre.trim() || genre || 'Retro Classic',
      developer: editDeveloper.trim() || developer || selectedGameForDetails.systemName || 'Classic',
      publisher: editPublisher.trim() || publisher || selectedGameForDetails.systemName || 'Classic',
      description: editDescription.trim() || description || `Experience ${selectedGameForDetails.title} on ${selectedGameForDetails.systemName}.`,
      walkthrough: {
        written: editWrittenGuide.trim() || undefined,
        video: editVideoGuide.trim() || undefined
      },
      source: 'Retro Player Export'
    };

    const blob = new Blob([JSON.stringify(sidecarData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metadata.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sfx?.playNotification?.();
  };

  const handleImportSidecar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result || '{}');
        if (json.title) setEditTitle(json.title);
        if (json.year || json.releaseYear) setEditYear(json.year || json.releaseYear);
        if (json.genre) setEditGenre(json.genre);
        if (json.developer) setEditDeveloper(json.developer);
        if (json.publisher) setEditPublisher(json.publisher);
        if (json.description) setEditDescription(json.description);
        if (json.cover) setEditCoverUrl(json.cover);
        if (json.walkthrough?.written || json.writtenWalkthroughUrl) setEditWrittenGuide(json.walkthrough?.written || json.writtenWalkthroughUrl);
        if (json.walkthrough?.video || json.videoWalkthroughUrl) setEditVideoGuide(json.walkthrough?.video || json.videoWalkthroughUrl);
        sfx?.playNotification?.();
        setEditSaveStatus('Imported Sidecar Data!');
        setTimeout(() => setEditSaveStatus(''), 2500);
      } catch (err) {
        console.error('Failed to parse sidecar JSON:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmDeleteGame = async () => {
    if (!selectedGameForDetails || !onDeleteGame) return;
    setIsDeleting(true);
    try {
      const success = await onDeleteGame(selectedGameForDetails);
      if (success) {
        sfx?.playMenuConfirm?.();
        setShowDeleteGameConfirm(false);
        setSelectedGameForDetails(null);
      }
    } catch (err) {
      console.error('Failed to delete game:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGameForDetails) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;

      // 1. Instantly update local preview
      setEditCoverUrl(dataUrl);

      const id = selectedGameForDetails.id || `${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const currentMeta = selectedMeta || {};
      let finalCover = dataUrl;
      let diskSaved = false;

      // 2. Persist directly to host disk sidecar
      try {
        const res = await fetch('/api/metadata/save-sidecar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: id,
            systemKey: selectedGameForDetails.systemKey,
            romPath: selectedGameForDetails.romUrl || selectedGameForDetails.url,
            title: editTitle.trim() || currentMeta.title || selectedGameForDetails.title,
            description: editDescription.trim(),
            releaseYear: editYear.trim(),
            developer: editDeveloper.trim() || selectedGameForDetails.systemName,
            publisher: editPublisher.trim() || selectedGameForDetails.systemName,
            genre: editGenre.trim() || 'Retro Classic',
            coverDataUrl: dataUrl
          })
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            diskSaved = true;
            if (resData.savedCoverUrl) {
              finalCover = `${resData.savedCoverUrl}?t=${Date.now()}`;
              setEditCoverUrl(finalCover);
            }
          }
        }
      } catch (err) {
        console.warn('Cover upload backend write err:', err);
      }

      // 3. Save to database and cache
      const updated = {
        ...currentMeta,
        id,
        title: editTitle.trim() || currentMeta.title || selectedGameForDetails.title,
        systemKey: selectedGameForDetails.systemKey,
        coverUrl: finalCover,
        hasCustomCover: true,
        isManualOverride: true,
        source: diskSaved ? 'Local Sidecar (Disk)' : 'Manual Edit',
        scrapedAt: new Date().toISOString()
      };
      await saveCachedMetadata(id, updated);
      scraper?.updateLocalMetadata?.(id, updated);
      sfx?.playNotification?.();
      setEditSaveStatus(diskSaved ? 'Cover Uploaded & Saved!' : 'Cover Saved in Browser!');
      setTimeout(() => setEditSaveStatus(''), 2000);
    };

    reader.onerror = (err) => {
      console.error('Failed reading selected image file:', err);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteCover = async () => {
    if (!selectedGameForDetails) return;
    setEditCoverUrl('');
    const id = selectedGameForDetails.id || `${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const updatedData = {
      ...(selectedMeta || {}),
      id,
      title: editTitle.trim() || selectedGameForDetails.title,
      systemKey: selectedGameForDetails.systemKey,
      coverUrl: null,
      hasCustomCover: false,
      isManualOverride: true,
      scrapedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/metadata/save-sidecar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          title: editTitle.trim() || selectedGameForDetails.title,
          systemKey: selectedGameForDetails.systemKey,
          romPath: selectedGameForDetails.romUrl || selectedGameForDetails.url,
          deleteCover: true
        })
      }).catch(() => { });
    } catch (_) { }

    await saveCachedMetadata(id, updatedData);
    scraper?.updateLocalMetadata?.(id, updatedData);
    sfx?.playDelete?.();
    setEditSaveStatus('Cover Deleted!');
    setTimeout(() => setEditSaveStatus(''), 2000);
  };

  const handleDeleteMetadata = async () => {
    if (!selectedGameForDetails) return;
    const id = selectedGameForDetails.id || `${selectedGameForDetails.systemKey}-${selectedGameForDetails.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // 1. Reset all fields to clean defaults
    setEditTitle(selectedGameForDetails.rawTitle || selectedGameForDetails.title);
    setEditYear('');
    setEditGenre('');
    setEditDeveloper('');
    setEditPublisher('');
    setEditDescription('');
    setEditCoverUrl('');
    setEditWrittenGuide('');
    setEditVideoGuide('');

    // 2. Delete sidecar on backend disk
    try {
      await fetch('/api/metadata/delete-sidecar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: id,
          systemKey: selectedGameForDetails.systemKey,
          romPath: selectedGameForDetails.romUrl || selectedGameForDetails.url,
          title: selectedGameForDetails.title
        })
      }).catch(() => { });
    } catch (_) { }

    // 3. Clear IndexedDB / Server DB and update local cache
    await deleteManualMetadata(id);
    scraper?.updateLocalMetadata?.(id, null);
    scraper?.clearLogs?.();
    sfx?.playDelete?.();
    setEditSaveStatus('Metadata Deleted & Reset!');
    setTimeout(() => setEditSaveStatus(''), 2000);
  };

  // Toggle QR Code Companion handler
  const handleToggleQr = (type, url) => {
    if (activeQrType === type) {
      setActiveQrType(null);
      setQrDataUrl('');
    } else {
      setActiveQrType(type);
      setCopiedLink(false);
      sfx?.playTileNav?.();
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then((data) => setQrDataUrl(data))
        .catch((err) => console.error('DS QR Generation Failed', err));
    }
  };

  // Copy guide link handler
  const handleCopyLink = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      sfx?.playNotification?.();
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (_) {
      return 'web guide';
    }
  };

  // Helper to render accurate battery icon and telemetry
  const renderBatteryIcon = () => {
    if (!gamepadBattery || !gamepadBattery.hasBatteryInfo) return null;
    const { batteryPercent, isCharging } = gamepadBattery;

    if (isCharging) {
      return <BatteryCharging size={14} className="battery-icon is-charging" />;
    }
    if (batteryPercent > 70) {
      return <BatteryFull size={14} className="battery-icon is-full" />;
    }
    if (batteryPercent > 30) {
      return <BatteryMedium size={14} className="battery-icon is-medium" />;
    }
    if (batteryPercent > 10) {
      return <BatteryLow size={14} className="battery-icon is-low" />;
    }
    return <BatteryWarning size={14} className="battery-icon is-critical" />;
  };

  const getGamepadTooltip = () => {
    if (!gamepadConnected) {
      return "No Gamepad Detected (Plug in USB or pair Bluetooth controller)";
    }
    if (gamepadBattery?.hasBatteryInfo) {
      const { batteryPercent, isCharging } = gamepadBattery;
      return `Gamepad: ${gamepadBattery.gamepadId || 'Controller'} • Battery: ${batteryPercent}% ${isCharging ? '(Charging ⚡)' : ''}`;
    }
    return `Gamepad Connected: ${gamepadBattery?.gamepadId || 'Ready'} • USB / Wireless Active`;
  };

  const getGamepadColor = () => {
    if (!gamepadConnected) return '#64748b';
    if (gamepadBattery?.hasBatteryInfo) {
      const { batteryPercent, isCharging } = gamepadBattery;
      if (isCharging) return '#10b981';
      if (batteryPercent <= 10) return '#ef4444';
      if (batteryPercent <= 20) return '#f59e0b';
      return '#10b981';
    }
    return '#10b981';
  };

  // Active Stage Detection:
  // Stage 1: Profile Selection
  // Stage 4: Game Detail
  // Stage 3: Game Selection
  // Stage 2: System Selection
  const isStageProfile = (!hasChosenProfileThisSession && profiles.length > 1) || showProfileSwitcher;
  const isStageDetail = !isStageProfile && !!selectedGameForDetails;
  const isStageGames = !isStageProfile && !isStageDetail && !!selectedSystem;
  const isStageSystems = !isStageProfile && !isStageDetail && !isStageGames;

  // =========================================================================
  // STAGE 1: CHOOSE PROFILE ("Who's Playing?")
  // =========================================================================
  if (isStageProfile) {
    return (
      <div className="mobile-app-root stage-profile-root">
        <div className="mobile-profile-gate">
          <div className="mobile-profile-gate-header">
            <div className="mobile-app-brand">
              <img src={resolveAssetPath('favicon.svg')} alt="Retro Player Logo" className="mobile-brand-logo" />
              <span className="mobile-brand-retro">RETRO</span>
              <span className="mobile-brand-player">PLAYER</span>
            </div>
          </div>

          <div className="mobile-profile-gate-body">
            <h1 className="mobile-profile-gate-title">Who&apos;s Playing?</h1>
            <p className="mobile-profile-gate-desc">
              Choose your profile to access your saves, favorite titles, and records.
            </p>

            <div className="mobile-profile-grid">
              {profiles.map((p) => {
                const isActive = p.id === activeProfileId;
                return (
                  <div
                    key={p.id}
                    className={`mobile-profile-item ${isActive ? 'is-active-profile' : ''}`}
                    onClick={() => {
                      onSelectProfile?.(p.id);
                      setHasChosenProfileThisSession(true);
                      setShowProfileSwitcher(false);
                      sfx?.playProfileSelect?.();
                    }}
                  >
                    <div
                      className="mobile-profile-avatar-wrap"
                      style={{ borderColor: p.favoriteColor || '#e11d48' }}
                    >
                      <MultiAvatar seed={p.avatarSeed || p.name || 'Player'} size={68} />
                      {isActive && (
                        <div className="mobile-profile-active-badge">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="mobile-profile-name">{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 4: SHOWS GAME DETAIL (Nintendo DS Dual-Screen Touch Architecture)
  // =========================================================================
  if (isStageDetail) {
    const gameLogs = (scraper?.logs || []).filter(l =>
      l.meta?.title === selectedGameForDetails.title ||
      l.meta?.gameId === selectedGameForDetails.id ||
      (selectedGameForDetails.title && l.message?.toLowerCase().includes(selectedGameForDetails.title.toLowerCase()))
    );

    const supportsBattery = selectedGameForDetails?.supportsBatterySaves !== false &&
      selectedGameForDetails?.systemKey !== 'arcade' &&
      selectedGameForDetails?.systemKey !== 'atari2600' &&
      !selectedGameForDetails?.systemName?.toLowerCase().includes('arcade') &&
      !selectedGameForDetails?.systemName?.toLowerCase().includes('atari 2600');

    return (
      <div className="mobile-app-root stage-detail-root">
        {/* Detail Top Navigation Bar */}
        <header className="mobile-detail-nav">
          <button
            type="button"
            className="mobile-detail-back-btn"
            onClick={() => {
              setSelectedGameForDetails(null);
              sfx?.playTileNav?.();
              haptics.selection();
            }}
          >
            <ArrowLeft size={16} />
            <span>{selectedSystem?.name || 'Consoles'}</span>
          </button>
        </header>

        {/* Game Detail Body */}
        <main className="mobile-detail-body">
          {/* Top Screen Frame: Snapshot / Box Art in DS Bezel (Only rendered if an authentic image exists) */}
          {(screenshotSrc || coverSrc) && (
            <div className="ds-screen-frame top-screen mobile-ds-top-screen">
              {screenshotSrc ? (
                <img src={screenshotSrc} alt="Gameplay Snapshot" className="ds-screen-img" />
              ) : (
                <img src={coverSrc} alt={selectedGameForDetails.title} className="ds-screen-img cover-fit" />
              )}
            </div>
          )}

          {/* Title & Metadata Block */}
          <div className="ds-game-title-card mobile-ds-title-card">
            <h1 className="ds-game-header-title">{selectedGameForDetails.title}</h1>
          </div>

          <div className="mobile-detail-pills-row">
            <span className="mobile-meta-pill"><Calendar size={12} /> {releaseYear}</span>
            <span className="mobile-meta-pill"><Cpu size={12} /> {genre}</span>
            <span className="mobile-meta-pill">Dev: {developer}</span>
          </div>

          {/* STAGE 5 LAUNCH: Big Primary Nintendo DS Play Button */}
          <div className="mobile-detail-cta-block">
            <button
              type="button"
              className="ds-play-now-btn mobile-ds-play-btn"
              onClick={() => {
                if (onPlayGame) {
                  haptics.medium();
                  onPlayGame(selectedGameForDetails);
                }
              }}
              title={`Play ${selectedGameForDetails.title}`}
              aria-label={`Play ${selectedGameForDetails.title} now`}
            >
              <div className="ds-play-inner">
                <Play size={20} fill="#ffffff" color="#ffffff" className="play-icon-glow" />
                <span className="ds-play-text">PLAY GAME NOW</span>
              </div>
            </button>
          </div>

          {/* DS Touch Action Toolbar */}
          <div className="ds-action-toolbar mobile-ds-action-toolbar">
            {/* Favorite Button */}
            <button
              type="button"
              className={`ds-tool-btn ds-icon-btn ${isSelectedFav ? 'is-favorited' : ''}`}
              onClick={() => {
                if (toggleFavorite) {
                  toggleFavorite(selectedGameForDetails);
                  sfx?.playFavoriteToggle?.(!isSelectedFav);
                  haptics.selection();
                }
              }}
              title={isSelectedFav ? 'Favorited' : 'Favorite'}
              aria-label={isSelectedFav ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Star size={16} fill={isSelectedFav ? '#f59e0b' : 'none'} color={isSelectedFav ? '#d97706' : 'currentColor'} />
            </button>

            {/* Pokémon Trainer Milestones Touch Tab (Only for Pokémon ROMs) */}
            {selectedGameForDetails && isPokemonRom(selectedGameForDetails) && (
              <button
                type="button"
                className={`ds-tool-btn ds-icon-btn ds-pokemon-tab-btn ${dsTab === 'pokemon' ? 'is-active' : ''}`}
                onClick={() => {
                  setDsTab(dsTab === 'pokemon' ? 'overview' : 'pokemon');
                  sfx?.playTabSwitch?.();
                  haptics.selection();
                }}
                title="Pokémon Trainer Milestones & Badge Case"
                aria-label="Pokémon Trainer Milestones"
              >
                <PokeballIcon size={17} isActive={dsTab === 'pokemon'} />
              </button>
            )}

            {/* Save RAM Touch Tab (Hidden for Arcade / MAME machines) */}
            {selectedGameForDetails && !['arcade', 'mame', 'cps1', 'cps2', 'cps3', 'neogeo'].includes(selectedGameForDetails.systemKey?.toLowerCase()) && !['arcade', 'mame', 'cps1', 'cps2', 'cps3', 'neogeo'].includes(selectedGameForDetails.systemCore?.toLowerCase()) && (
              <button
                type="button"
                className={`ds-tool-btn ds-icon-btn ds-save-tab-btn ${dsTab === 'save' ? 'is-active' : ''}`}
                onClick={() => {
                  setDsTab(dsTab === 'save' ? 'overview' : 'save');
                  sfx?.playTabSwitch?.();
                  haptics.selection();
                }}
                title="In-Game Save Data & Battery RAM (.sav)"
                aria-label="Save Data"
              >
                <Save size={16} color={dsTab === 'save' ? '#ffffff' : '#10b981'} />
              </button>
            )}

            {/* Guides Touch Tab */}
            {hasGuides && (
              <button
                type="button"
                className={`ds-tool-btn ds-icon-btn ds-guide-btn ${dsTab === 'guides' ? 'is-active' : ''}`}
                onClick={() => {
                  setDsTab(dsTab === 'guides' ? 'overview' : 'guides');
                  sfx?.playTabSwitch?.();
                  haptics.selection();
                }}
                title="Strategy Guides & Walkthroughs"
                aria-label="Strategy Guides"
              >
                <BookOpen size={16} color={dsTab === 'guides' ? '#ffffff' : '#3b82f6'} />
              </button>
            )}

            {/* Edit & Scrape Touch Tab */}
            <button
              type="button"
              className={`ds-tool-btn ds-icon-btn ds-edit-tab-btn ${dsTab === 'manage' ? 'is-active' : ''}`}
              onClick={() => {
                setDsTab(dsTab === 'manage' ? 'overview' : 'manage');
                sfx?.playTabSwitch?.();
                haptics.selection();
              }}
              title="Edit Game Metadata & Scraper Studio"
              aria-label="Edit & Scrape"
            >
              <Pencil size={16} color={dsTab === 'manage' ? '#ffffff' : 'currentColor'} />
            </button>
          </div>

          {/* =========================================================================
              VIEW 1: OVERVIEW (Playtime Analytics & Hardware Specs)
              ========================================================================= */}
          {dsTab === 'overview' && (
            <div className="ds-tab-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Playtime Stats Card */}
              <div className="ds-stats-card">
                <div className="ds-stats-row-3">
                  <div className="ds-stat-item">
                    <div className="ds-stat-label">
                      <Clock size={12} color="#3b82f6" />
                      <span>Playtime</span>
                    </div>
                    <div className="ds-stat-val-group">
                      <span className="ds-stat-val">{selectedStats?.playtimeFormatted || '< 1 min'}</span>
                    </div>
                  </div>

                  <div className="ds-stat-divider" />

                  <div className="ds-stat-item">
                    <div className="ds-stat-label">
                      <History size={12} color="#10b981" />
                      <span>Sessions</span>
                    </div>
                    <span className="ds-stat-val">{selectedStats?.launchCount || 0}</span>
                  </div>

                  <div className="ds-stat-divider" />

                  <div className="ds-stat-item">
                    <div className="ds-stat-label">
                      <Calendar size={12} color="#f59e0b" />
                      <span>Last Played</span>
                    </div>
                    <span className="ds-stat-val ds-stat-date">{selectedStats?.lastPlayedFormatted || 'Never'}</span>
                  </div>
                </div>
              </div>

              {/* Per-ROM Mastered Milestones Card */}
              {(() => {
                const perRomMilestones = selectedGameForDetails && achievementsEngine?.getGameMilestones
                  ? achievementsEngine.getGameMilestones(selectedGameForDetails.id || selectedGameForDetails.title)
                  : [];
                if (perRomMilestones.length === 0) return null;
                return (
                  <div className="ds-per-rom-trophies-card animate-fade-in" style={{ marginBottom: '0.5rem' }}>
                    <div className="ds-trophies-header">
                      <Trophy size={13} color="#f59e0b" />
                      <span>Trophies Mastered ({perRomMilestones.length})</span>
                    </div>
                    <div className="ds-trophies-badge-row">
                      {perRomMilestones.map(t => (
                        <div key={t.id} className={`ds-trophy-mini-badge tier-${t.tier}`} title={`${t.title}: ${t.description}`}>
                          <Trophy size={11} />
                          <span>{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Bottom Screen Frame: Synopsis & Game Overview */}
              <div className="ds-screen-frame bottom-screen mobile-ds-bottom-screen">
                <div className="ds-synopsis-content">
                  <strong style={{ fontSize: '0.8rem', color: 'var(--poke-red, #e11d48)' }}>Synopsis &amp; Game Overview</strong>
                  <p className="ds-synopsis-text">
                    {description || 'No description available yet. Use the Scraper or click Edit (✏️) to add your own synopsis.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 1B: POKÉMON TRAINER MILESTONES & BADGE CASE
              ========================================================================= */}
          {dsTab === 'pokemon' && (
            <div className="ds-tab-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div className="ds-stats-card">
                <div className="ds-stat-label" style={{ marginBottom: '0.4rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Trophy size={13} color="#f59e0b" />
                    <span>Trainer Milestones &amp; Badges</span>
                  </div>
                </div>

                {/* Regional League Badge Case Trays */}
                {(() => {
                  const isJohto = isJohtoPokemonGame(selectedGameForDetails);
                  if (isJohto) {
                    const johtoBadges = getPokemonBadgesForGame(selectedGameForDetails);
                    const kantoBadges = getPokemonKantoBadgesForGame(selectedGameForDetails);
                    return (
                      <div style={{ padding: '0.2rem 0 0.1rem 0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {/* 1. Johto League Case (8 Badges) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Johto League Badge Case (8)
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                            {johtoBadges.map((badge, idx) => {
                              const num = idx + 1;
                              const badgeKey = `poke_badge_${num}`;
                              const badgeLabel = badge.name.replace(' Badge', '');
                              const isBadgeEarned = isPokemonMilestoneEarned(achievementsEngine?.unlocked, badgeKey, selectedGameForDetails);
                              return (
                                <div
                                  key={badge.name}
                                  className={`ds-badge-box ${isBadgeEarned ? 'is-earned' : 'is-locked'}`}
                                  title={`${badge.name}: Defeat ${badge.leader} in ${badge.city} (${badge.type} Type)`}
                                >
                                  {badge.image ? (
                                    <img
                                      src={badge.image}
                                      alt={badge.name}
                                      className={`ds-badge-img ${isBadgeEarned ? 'is-earned' : 'is-locked'}`}
                                    />
                                  ) : (
                                    <Shield size={16} color={isBadgeEarned ? '#f59e0b' : 'var(--text-sub)'} fill={isBadgeEarned ? '#f59e0b' : 'none'} />
                                  )}
                                  <span style={{ fontSize: '0.61rem', fontWeight: 800, color: isBadgeEarned ? '#d97706' : 'var(--text-sub)' }}>
                                    {badgeLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Kanto Return League Case (8 Badges) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.63rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Kanto Return League Badge Case (8)
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                            {kantoBadges.map((badge, idx) => {
                              const num = idx + 1;
                              const badgeKey = `poke_badge_kanto_${num}`;
                              const badgeLabel = badge.name.replace(' Badge', '');
                              const isBadgeEarned = isPokemonMilestoneEarned(achievementsEngine?.unlocked, badgeKey, selectedGameForDetails);
                              return (
                                <div
                                  key={badge.name}
                                  className={`ds-badge-box ${isBadgeEarned ? 'is-earned' : 'is-locked'}`}
                                  title={`Kanto ${badge.name}: Defeat ${badge.leader} in ${badge.city} (${badge.type} Type)`}
                                >
                                  {badge.image ? (
                                    <img
                                      src={badge.image}
                                      alt={badge.name}
                                      className={`ds-badge-img ${isBadgeEarned ? 'is-earned' : 'is-locked'}`}
                                    />
                                  ) : (
                                    <Shield size={16} color={isBadgeEarned ? '#f59e0b' : 'var(--text-sub)'} fill={isBadgeEarned ? '#f59e0b' : 'none'} />
                                  )}
                                  <span style={{ fontSize: '0.61rem', fontWeight: 800, color: isBadgeEarned ? '#d97706' : 'var(--text-sub)' }}>
                                    {badgeLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Standard Single Regional Badge Case (Gen 1 Kanto, Gen 3 Hoenn, etc.)
                  const regionalBadges = getPokemonBadgesForGame(selectedGameForDetails);
                  return (
                    <div style={{ padding: '0.35rem 0 0.15rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Regional League Badge Case
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                        {regionalBadges.map((badge, idx) => {
                          const num = idx + 1;
                          const badgeKey = `poke_badge_${num}`;
                          const badgeLabel = badge.name.replace(' Badge', '');
                          const isBadgeEarned = isPokemonMilestoneEarned(achievementsEngine?.unlocked, badgeKey, selectedGameForDetails);
                          return (
                            <div
                              key={badge.name}
                              className={`ds-badge-box ${isBadgeEarned ? 'is-earned' : 'is-locked'}`}
                              title={`${badge.name}: Defeat ${badge.leader} in ${badge.city} (${badge.type} Type)`}
                            >
                              {badge.image ? (
                                <img
                                  src={badge.image}
                                  alt={badge.name}
                                  className={`ds-badge-img ${isBadgeEarned ? 'is-earned' : 'is-locked'}`}
                                />
                              ) : (
                                <Shield size={16} color={isBadgeEarned ? '#f59e0b' : 'var(--text-sub)'} fill={isBadgeEarned ? '#f59e0b' : 'none'} />
                              )}
                              <span style={{ fontSize: '0.63rem', fontWeight: 800, color: isBadgeEarned ? '#d97706' : 'var(--text-sub)' }}>
                                {badgeLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Individual Pokémon Milestones List (Sorted Unlocked First) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {(() => {
                  const milestones = getPokemonMilestonesForGame(selectedGameForDetails);
                  const sorted = [...milestones].sort((a, b) => {
                    const aEarned = isPokemonMilestoneEarned(achievementsEngine?.unlocked, a.id, selectedGameForDetails);
                    const bEarned = isPokemonMilestoneEarned(achievementsEngine?.unlocked, b.id, selectedGameForDetails);
                    if (aEarned && !bEarned) return -1;
                    if (!aEarned && bEarned) return 1;
                    return 0;
                  });
                  return sorted.map(item => {
                    const isEarned = isPokemonMilestoneEarned(achievementsEngine?.unlocked, item.id, selectedGameForDetails);
                    const IconComponent = POKE_ICON_MAP[item.icon] || Sparkles;

                    // Thematic accent colors based on Pokémon in-game milestone type
                    const typeColors = {
                      story: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.35)' },
                      hm: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.35)' },
                      legendary: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' },
                      league: { bg: 'rgba(234, 179, 8, 0.14)', color: '#eab308', border: 'rgba(234, 179, 8, 0.45)' },
                      exclusive: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.35)' }
                    };
                    const accent = typeColors[item.type] || typeColors.story;

                    return (
                      <div
                        key={item.id}
                        className={`ds-poke-milestone-tile type-${item.type || 'story'} ${isEarned ? 'is-earned' : 'is-locked'}`}
                      >
                        {/* Left Milestone Icon Box */}
                        <div
                          className="ds-poke-icon-box"
                          style={{
                            background: isEarned ? accent.bg : 'var(--bg-glass)',
                            color: isEarned ? accent.color : 'var(--text-sub)',
                            borderColor: isEarned ? accent.border : 'var(--panel-border)'
                          }}
                        >
                          {isEarned ? (
                            <IconComponent size={17} strokeWidth={2.4} />
                          ) : (
                            <Lock size={15} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isEarned ? 'var(--text-main)' : 'var(--text-sub)' }}>
                                {item.title}
                              </span>
                              {isEarned && (
                                <CheckCircle2 size={12} color="#10b981" style={{ flexShrink: 0 }} />
                              )}
                            </div>
                            <span
                              className="trophy-ds-points-pill"
                              style={{
                                background: isEarned ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-glass)',
                                color: isEarned ? '#059669' : 'var(--text-sub)',
                                borderColor: isEarned ? 'rgba(16, 185, 129, 0.35)' : 'var(--panel-border)',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                letterSpacing: '0.03em',
                                padding: '1px 5px'
                              }}
                            >
                              {isEarned ? 'UNLOCKED' : 'LOCKED'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.66rem', color: 'var(--text-sub)', margin: '0.15rem 0 0 0', lineHeight: 1.25 }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: IN-GAME SAVE & BATTERY RAM STUDIO (.SAV)
              ========================================================================= */}
          {dsTab === 'save' && (
            <div className="ds-tab-pane ds-save-studio animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <input
                type="file"
                ref={saveFileInputRef}
                accept=".sav,.srm,.state,.ram,.mcr,application/octet-stream"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && onImportSave && selectedGameForDetails) {
                    setSaveActionStatus('Importing save...');
                    const success = await onImportSave(file, selectedGameForDetails);
                    if (success) {
                      sfx?.playMenuConfirm?.();
                      setSaveActionStatus('Save file imported successfully!');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    } else {
                      setSaveActionStatus('Failed to import save file.');
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    }
                  }
                  e.target.value = '';
                }}
              />

              {saveActionStatus && (
                <div className="ds-save-status-toast animate-fade-in">
                  <span>{saveActionStatus}</span>
                </div>
              )}

              {/* Save Action Tiles */}
              <div className="ds-save-tiles-group">
                {/* Export Battery Save (.sav) */}
                <button
                  type="button"
                  className="ds-save-action-tile"
                  onClick={async () => {
                    if (selectedGameForDetails) {
                      setSaveActionStatus('Exporting battery save (.sav)...');
                      const fn = onExportBatterySave || onExportSave;
                      const success = await fn(selectedGameForDetails);
                      if (success) {
                        sfx?.playNotification?.();
                        setSaveActionStatus('Downloaded .sav battery save!');
                        setTimeout(() => setSaveActionStatus(''), 4000);
                      } else {
                        setSaveActionStatus('No .sav battery save found. Save in-game first!');
                        setTimeout(() => setSaveActionStatus(''), 4000);
                      }
                    }
                  }}
                >
                  <div className="ds-save-tile-icon export">
                    <Download size={16} />
                  </div>
                  <div className="ds-save-tile-content">
                    <div className="ds-save-tile-title">Export Battery Save (.sav)</div>
                    <div className="ds-save-tile-sub">Download in-game cartridge SRAM save file</div>
                  </div>
                </button>

                {/* Export Quick Save (.state) */}
                <button
                  type="button"
                  className="ds-save-action-tile"
                  onClick={async () => {
                    if (selectedGameForDetails) {
                      setSaveActionStatus('Exporting quick save (.state)...');
                      const fn = onExportQuickSave || onExportSave;
                      const success = await fn(selectedGameForDetails);
                      if (success) {
                        sfx?.playNotification?.();
                        setSaveActionStatus('Downloaded .state quick save snapshot!');
                        setTimeout(() => setSaveActionStatus(''), 4000);
                      } else {
                        setSaveActionStatus('No .state quick save found. Press Quick Save first!');
                        setTimeout(() => setSaveActionStatus(''), 4000);
                      }
                    }
                  }}
                >
                  <div className="ds-save-tile-icon export" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    <Download size={16} />
                  </div>
                  <div className="ds-save-tile-content">
                    <div className="ds-save-tile-title">Export Quick Save (.state)</div>
                    <div className="ds-save-tile-sub">Download emulator snapshot state file</div>
                  </div>
                </button>

                {/* Import Tile */}
                <button
                  type="button"
                  className="ds-save-action-tile"
                  onClick={() => saveFileInputRef.current?.click()}
                >
                  <div className="ds-save-tile-icon import">
                    <Upload size={16} />
                  </div>
                  <div className="ds-save-tile-content">
                    <div className="ds-save-tile-title">Import Save / State (.sav / .state)</div>
                    <div className="ds-save-tile-sub">Upload an existing .sav battery save or .state snapshot</div>
                  </div>
                </button>

                {/* Delete Tile */}
                <button
                  type="button"
                  className="ds-save-action-tile is-delete"
                  onClick={() => {
                    setShowDeleteSaveConfirm(true);
                    sfx?.playTileNav?.();
                  }}
                >
                  <div className="ds-save-tile-icon delete">
                    <Trash2 size={16} />
                  </div>
                  <div className="ds-save-tile-content">
                    <div className="ds-save-tile-title">Delete All Saved Data</div>
                    <div className="ds-save-tile-sub">Erase in-game saves & quick save states</div>
                  </div>
                </button>
              </div>

              {/* Delete Save Confirmation Modal */}
              <ConfirmModal
                isOpen={showDeleteSaveConfirm}
                title="Delete All Saved Data?"
                message={`Are you sure you want to permanently erase the saved battery RAM (.sav) and quick save states (.state) for "${selectedGameForDetails?.title}"? This action cannot be undone.`}
                confirmLabel="Delete All Saves"
                cancelLabel="Cancel"
                isDestructive={true}
                onConfirm={async () => {
                  setShowDeleteSaveConfirm(false);
                  if (onDeleteSave && selectedGameForDetails) {
                    try {
                      setSaveActionStatus('Deleting save data...');
                      const ok = await onDeleteSave(selectedGameForDetails);
                      sfx?.playDelete?.();
                      setSaveActionStatus(ok ? 'Save data & states erased!' : 'Save data erased.');
                    } catch (err) {
                      setSaveActionStatus('Failed to erase save data.');
                    } finally {
                      setTimeout(() => setSaveActionStatus(''), 4000);
                    }
                  }
                }}
                onCancel={() => setShowDeleteSaveConfirm(false)}
                sfx={sfx}
              />
            </div>
          )}

          {/* =========================================================================
              VIEW 3: STRATEGY GUIDES & WALKTHROUGHS QR COMPANION
              ========================================================================= */}
          {dsTab === 'guides' && (
            <div className="ds-tab-pane ds-guides-pane animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div className="ds-guides-touch-list">
                {/* Channel 1: Written Strategy Guide */}
                {writtenGuideUrl && (
                  <div className={`ds-guide-card ${activeQrType === 'written' ? 'is-qr-open' : ''}`}>
                    <div className="ds-guide-card-top">
                      <div className="ds-guide-icon written">
                        <BookOpen size={16} />
                      </div>
                      <div className="ds-guide-info">
                        <div className="ds-guide-name-row">
                          <strong>Written Guide</strong>
                          <span className="ds-domain-tag">{getDomain(writtenGuideUrl)}</span>
                        </div>
                        <span className="ds-guide-sub">Walkthrough &amp; maps</span>
                      </div>
                      <div className="ds-guide-actions">
                        <button
                          type="button"
                          className="ds-guide-act-btn primary"
                          onClick={() => {
                            achievementsEngine?.triggerStrategyGuideRead?.(selectedGameForDetails, 60);
                            window.open(writtenGuideUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <Globe size={12} />
                          <span>Open</span>
                        </button>
                        <button
                          type="button"
                          className={`ds-guide-act-btn qr ${activeQrType === 'written' ? 'active' : ''}`}
                          onClick={() => {
                            achievementsEngine?.triggerStrategyGuideRead?.(selectedGameForDetails, 60);
                            handleToggleQr('written', writtenGuideUrl);
                          }}
                        >
                          <Smartphone size={12} />
                          <span>QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline QR Frame */}
                    {activeQrType === 'written' && (
                      <div className="ds-inline-qr-box animate-fade-in">
                        <div className="ds-qr-frame">
                          {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Guide QR" className="ds-qr-img" />
                          ) : (
                            <span style={{ fontSize: '0.65rem' }}>Loading QR...</span>
                          )}
                        </div>
                        <div className="ds-qr-info">
                          <span className="ds-qr-hint">Scan with secondary device to read</span>
                          <button
                            type="button"
                            className="ds-copy-btn"
                            onClick={() => handleCopyLink(writtenGuideUrl)}
                          >
                            {copiedLink ? <Check size={12} color="#10b981" /> : <ExternalLink size={12} />}
                            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Channel 2: Video Longplay */}
                {videoGuideUrl && (
                  <div className={`ds-guide-card ${activeQrType === 'video' ? 'is-qr-open' : ''}`}>
                    <div className="ds-guide-card-top">
                      <div className="ds-guide-icon video">
                        <Tv size={16} />
                      </div>
                      <div className="ds-guide-info">
                        <div className="ds-guide-name-row">
                          <strong>Video Longplay</strong>
                          <span className="ds-domain-tag">{getDomain(videoGuideUrl)}</span>
                        </div>
                        <span className="ds-guide-sub">Full video playlist</span>
                      </div>
                      <div className="ds-guide-actions">
                        <button
                          type="button"
                          className="ds-guide-act-btn video-act"
                          onClick={() => {
                            achievementsEngine?.triggerStrategyGuideRead?.(selectedGameForDetails, 60);
                            window.open(videoGuideUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <Globe size={12} />
                          <span>Watch</span>
                        </button>
                        <button
                          type="button"
                          className={`ds-guide-act-btn qr ${activeQrType === 'video' ? 'active' : ''}`}
                          onClick={() => {
                            achievementsEngine?.triggerStrategyGuideRead?.(selectedGameForDetails, 60);
                            handleToggleQr('video', videoGuideUrl);
                          }}
                        >
                          <Smartphone size={12} />
                          <span>QR</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline QR Frame */}
                    {activeQrType === 'video' && (
                      <div className="ds-inline-qr-box animate-fade-in">
                        <div className="ds-qr-frame">
                          {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Video QR" className="ds-qr-img" />
                          ) : (
                            <span style={{ fontSize: '0.65rem' }}>Loading QR...</span>
                          )}
                        </div>
                        <div className="ds-qr-info">
                          <span className="ds-qr-hint">Scan with secondary device to watch</span>
                          <button
                            type="button"
                            className="ds-copy-btn"
                            onClick={() => handleCopyLink(videoGuideUrl)}
                          >
                            {copiedLink ? <Check size={12} color="#10b981" /> : <ExternalLink size={12} />}
                            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden Cover Image Upload Input */}
          <input
            type="file"
            ref={coverImageInputRef}
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={handleCoverUpload}
          />

          {/* Hidden Sidecar JSON Upload Input */}
          <input
            type="file"
            ref={sidecarInputRef}
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportSidecar}
          />

          {/* =========================================================================
              VIEW 4: METADATA CUSTOMIZER & ONLINE SCRAPER STUDIO
              ========================================================================= */}
          {dsTab === 'manage' && (
            <div className="ds-tab-pane ds-manage-pane animate-fade-in">
              <form onSubmit={handleSaveEdit} className="ds-inline-form-card">
                {/* Header Identity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Sparkles size={14} color="#f59e0b" />
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{selectedGameForDetails.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-sub)' }}>{selectedGameForDetails.systemName}</span>
                </div>

                {/* Section 1: Cover Artwork Studio */}
                <div className="ds-scrape-asset-card" style={{ padding: '0.45rem 0.55rem', background: 'rgba(100, 116, 139, 0.06)', borderRadius: '4px', border: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Image size={13} color="#3b82f6" />
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Cover Artwork</span>
                    </div>
                    {coverSrc ? (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={11} /> Box Art Available
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b' }}>
                        No Box Art on Remote DBs
                      </span>
                    )}
                  </div>

                  {coverSrc ? (
                    <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
                      <img
                        src={coverSrc}
                        alt="Game Cover"
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1.5px solid var(--panel-border)' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {selectedMeta?.hasCustomCover ? 'Custom / Uploaded Cover' : (selectedGameForDetails.hasSidecar ? 'Local Companion Sidecar' : 'Libretro CDN / ScreenScraper')}
                        </span>
                        <div style={{ display: 'flex', gap: '0.45rem' }}>
                          <button
                            type="button"
                            className="ds-inline-btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.64rem' }}
                            onClick={() => coverImageInputRef.current?.click()}
                          >
                            <Upload size={10} />
                            <span>Replace Cover</span>
                          </button>

                          <button
                            type="button"
                            className="ds-inline-btn-danger"
                            style={{ padding: '0.2rem 0.45rem', fontSize: '0.64rem' }}
                            onClick={handleDeleteCover}
                            title="Delete Box Art cover"
                          >
                            <Trash2 size={10} />
                            <span>Delete Cover</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <p style={{ fontSize: '0.66rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35 }}>
                        Searched Libretro CDN &amp; TheGamesDB (No official box art found on remote servers).
                      </p>
                      <button
                        type="button"
                        className="ds-inline-btn-secondary"
                        style={{ width: 'fit-content', padding: '0.25rem 0.55rem', fontSize: '0.66rem' }}
                        onClick={() => coverImageInputRef.current?.click()}
                      >
                        <Upload size={11} />
                        <span>Upload Custom Cover</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 2: Top Actions (Save Changes & Delete Game) */}
                <div style={{ display: 'flex', gap: '0.45rem', width: '100%' }}>
                  <button
                    type="submit"
                    className="ds-inline-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={isSavingEdit}
                  >
                    {isSavingEdit ? <RefreshCw size={13} className="spin" /> : <Save size={13} />}
                    <span>{editSaveStatus || (isSavingEdit ? 'Saving...' : 'Save Changes')}</span>
                  </button>

                  <button
                    type="button"
                    className="ds-inline-btn-danger"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      setShowDeleteGameConfirm(true);
                      sfx?.playModalOpen?.();
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Game</span>
                  </button>
                </div>

                {/* Section 3: Online Scraper & Live Terminal Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <FileText size={11} color="#64748b" />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-sub)' }}>Metadata / Cover Search</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="ds-inline-btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem' }}
                        onClick={handleManualScrape}
                        disabled={isLocalScraping}
                        title="Search online databases (Libretro CDN & Game DB)"
                      >
                        <RefreshCw size={10} className={isLocalScraping ? 'spin' : ''} />
                        <span>{isLocalScraping ? 'Scraping...' : 'Scrape'}</span>
                      </button>

                      <button
                        type="button"
                        className="ds-inline-btn-danger"
                        style={{ padding: '0.2rem 0.45rem', fontSize: '0.65rem' }}
                        onClick={handleDeleteMetadata}
                        title="Delete metadata sidecar, reset all fields below, and clear search logs"
                      >
                        <Trash2 size={10} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {(isLocalScraping || gameLogs.length > 0) && (
                    <div className="ds-scraper-terminal-logs animate-fade-in">
                      {gameLogs.length > 0 ? (
                        gameLogs.map((log, idx) => (
                          <div key={log.id || idx} className={`ds-log-line log-${log.type}`}>
                            <span className="log-time">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'LOG'}</span>
                            <span className="log-msg">{log.message}</span>
                          </div>
                        ))
                      ) : (
                        <div className="ds-log-line log-info">
                          <span className="log-msg">Starting online database queries...</span>
                        </div>
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>

                {/* Section 3: Metadata Form Fields */}
                <div className="ds-field-group">
                  <label className="ds-field-label">Display Title</label>
                  <input
                    type="text"
                    className="ds-field-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Super Mario World"
                  />
                </div>

                <div className="ds-field-row-2">
                  <div className="ds-field-group">
                    <label className="ds-field-label">Release Year</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      placeholder="e.g. 1996"
                    />
                  </div>
                  <div className="ds-field-group">
                    <label className="ds-field-label">Genre</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editGenre}
                      onChange={(e) => setEditGenre(e.target.value)}
                      placeholder="e.g. Platformer"
                    />
                  </div>
                </div>

                <div className="ds-field-row-2">
                  <div className="ds-field-group">
                    <label className="ds-field-label">Developer</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editDeveloper}
                      onChange={(e) => setEditDeveloper(e.target.value)}
                      placeholder="e.g. Nintendo"
                    />
                  </div>
                  <div className="ds-field-group">
                    <label className="ds-field-label">Publisher</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editPublisher}
                      onChange={(e) => setEditPublisher(e.target.value)}
                      placeholder="e.g. Nintendo"
                    />
                  </div>
                </div>

                <div className="ds-field-group">
                  <label className="ds-field-label">Plot Synopsis / Overview</label>
                  <textarea
                    className="ds-field-textarea"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter game storyline, overview, or synopsis..."
                  />
                </div>

                <div className="ds-field-row-2">
                  <div className="ds-field-group">
                    <label className="ds-field-label">Written Guide URL</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editWrittenGuide}
                      onChange={(e) => setEditWrittenGuide(e.target.value)}
                      placeholder="https://strategywiki.org/..."
                    />
                  </div>
                  <div className="ds-field-group">
                    <label className="ds-field-label">Video Guide URL</label>
                    <input
                      type="text"
                      className="ds-field-input"
                      value={editVideoGuide}
                      onChange={(e) => setEditVideoGuide(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                {/* Section 4: Sidecar JSON Import & Export Actions */}
                <div className="ds-inline-actions" style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '0.45rem', marginTop: '0.3rem', display: 'flex', gap: '0.45rem' }}>
                  <button
                    type="button"
                    className="ds-inline-btn-secondary"
                    onClick={() => sidecarInputRef.current?.click()}
                    title="Import metadata.json sidecar file"
                    style={{ flex: 1 }}
                  >
                    <Upload size={12} />
                    <span>Import Sidecar</span>
                  </button>

                  <button
                    type="button"
                    className="ds-inline-btn-secondary"
                    onClick={handleExportSidecar}
                    title="Export local metadata.json sidecar file"
                    style={{ flex: 1 }}
                  >
                    <Download size={12} />
                    <span>Export Sidecar</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Delete Game Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteGameConfirm}
          title="Delete Game?"
          message={`Are you sure you want to delete "${selectedGameForDetails?.title}"? This will permanently remove the ROM and metadata sidecars from your collection.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Game'}
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmDeleteGame}
          onCancel={() => setShowDeleteGameConfirm(false)}
          sfx={sfx}
        />
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: CHOOSE GAME (3-Column Square Beveled DS Button Grid)
  // =========================================================================
  if (isStageGames) {
    const systemTitle = selectedSystem?.name || 'All Games';

    return (
      <div className="mobile-app-root stage-games-root">
        {/* Topbar Navigation */}
        <header className="mobile-games-nav">
          <button
            type="button"
            className="mobile-games-back-btn"
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
              setSelectedSystem(null);
              sfx?.playTileNav?.();
              haptics.selection();
            }}
          >
            <ArrowLeft size={16} />
            <span>Consoles</span>
          </button>

          <div className="mobile-games-nav-center">
            {selectedSystem?.icon && (
              <img src={resolveAssetPath(selectedSystem.icon)} alt="" className="mobile-games-nav-sys-icon" />
            )}
            <span className="mobile-games-nav-title">{systemTitle}</span>
          </div>

          <div className="mobile-games-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className={`mobile-topbar-action-btn ${isSearchOpen || searchQuery ? 'is-active' : ''}`}
              onClick={() => {
                setIsSearchOpen(prev => !prev);
                sfx?.playTileNav?.();
                haptics.selection();
              }}
              title="Search Games"
              aria-label="Search Games"
            >
              <Search size={16} />
            </button>
          </div>
        </header>

        {/* Expandable Search Bar in Stage 3 */}
        {isSearchOpen && (
          <div className="mobile-expandable-search-bar animate-fade-in">
            <div className="mobile-search-widget">
              <Search size={16} className="mobile-search-icon" />
              <input
                type="text"
                className="mobile-search-input"
                placeholder={selectedSystem?.name ? `Search ${selectedSystem.name}...` : 'Search games...'}
                value={searchQuery}
                autoFocus
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="mobile-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game Content Grid */}
        <main className="mobile-games-grid-body">
          {currentGamesList.length > 0 ? (
            <div className="mobile-ds-buttons-grid">
              {currentGamesList.map((game, idx) => {
                const meta = metadataMap[game.id] || metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
                const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
                const rawThumb = meta?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
                const thumbSrc = rawThumb ? resolveAssetPath(rawThumb) : null;

                return (
                  <button
                    key={game.id || idx}
                    type="button"
                    className={`ds-touch-btn ${isFav ? 'is-fav' : ''}`}
                    onClick={() => {
                      setSelectedGameForDetails(game);
                      sfx?.playTileNav?.();
                      haptics.medium();
                    }}
                    title={game.title}
                  >
                    {thumbSrc ? (
                      <img src={thumbSrc} alt={game.title} className="ds-btn-thumb" loading="lazy" />
                    ) : (
                      <span className="ds-btn-text">{game.title}</span>
                    )}
                    {isFav && <span className="ds-fav-dot">★</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mobile-empty-catalog">
              <FolderOpen size={48} color="#64748b" />
              <h3>No Games Found</h3>
              <p>No ROM files found matching this filter.</p>
              <div className="mobile-empty-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="mobile-ds-play-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '0.85rem', background: '#3b82f6', borderColor: '#2563eb' }}
                  onClick={() => {
                    setShowLoadRomModal?.(true);
                    sfx?.playModalOpen?.();
                  }}
                >
                  <FolderOpen size={16} />
                  <span>Load Custom ROM</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Modern Console-Grade Mobile Bottom Navigation Bar in Games List */}
        <nav className="mobile-bottom-nav-bar" aria-label="Main Mobile Navigation">
          {/* Tab 1: All Games / Library */}
          <button
            type="button"
            className={`mobile-nav-tab ${selectedSystem?.key === 'all' && !isHamburgerOpen ? 'is-active' : ''}`}
            onClick={() => {
              if (isHamburgerOpen) setIsHamburgerOpen(false);
              setSelectedSystem({ key: 'all', name: 'All Games', icon: 'assets/platforms/gba.svg' });
              sfx?.playTabSwitch?.();
              haptics.selection();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Library - All Games"
          >
            <div className="mobile-nav-icon-wrap">
              <Gamepad2 size={20} />
            </div>
            <span className="mobile-nav-label">Library</span>
          </button>

          {/* Tab 2: Favorites */}
          <button
            type="button"
            className={`mobile-nav-tab ${selectedSystem?.key === 'favorites' && !isHamburgerOpen ? 'is-active' : ''}`}
            onClick={() => {
              if (isHamburgerOpen) setIsHamburgerOpen(false);
              setSelectedSystem({ key: 'favorites', name: 'Favorites', icon: null });
              sfx?.playTabSwitch?.();
              haptics.selection();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Favorites"
          >
            <div className="mobile-nav-icon-wrap">
              <Star size={20} fill={selectedSystem?.key === 'favorites' && !isHamburgerOpen ? '#f59e0b' : 'none'} color={selectedSystem?.key === 'favorites' && !isHamburgerOpen ? '#f59e0b' : 'currentColor'} />
            </div>
            <span className="mobile-nav-label">Favorites</span>
          </button>

          {/* Tab 3: Recent */}
          <button
            type="button"
            className={`mobile-nav-tab ${selectedSystem?.key === 'recent' && !isHamburgerOpen ? 'is-active' : ''}`}
            onClick={() => {
              if (isHamburgerOpen) setIsHamburgerOpen(false);
              setSelectedSystem({ key: 'recent', name: 'Recently Played', icon: null });
              sfx?.playTabSwitch?.();
              haptics.selection();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Recently Played Games"
          >
            <div className="mobile-nav-icon-wrap">
              <Clock size={20} />
            </div>
            <span className="mobile-nav-label">Recent</span>
          </button>

          {/* Tab 4: Trophies / Hall of Fame */}
          <button
            type="button"
            className="mobile-nav-tab"
            onClick={() => {
              if (isHamburgerOpen) setIsHamburgerOpen(false);
              onOpenTrophyModal?.();
              sfx?.playModalOpen?.();
              haptics.medium();
            }}
            aria-label="Trophy Cabinet & Achievements"
          >
            <div className="mobile-nav-icon-wrap">
              <Trophy size={20} color="#f59e0b" />
            </div>
            <span className="mobile-nav-label">Trophies</span>
          </button>

          {/* Tab 5: Tools & System Utilities (Opens Bottom Drawer) */}
          <button
            type="button"
            className={`mobile-nav-tab ${isHamburgerOpen ? 'is-active' : ''}`}
            onClick={() => {
              setIsHamburgerOpen(prev => !prev);
              sfx?.playTileNav?.();
              haptics.medium();
            }}
            aria-label="Console Utilities & Settings"
          >
            <div className="mobile-nav-icon-wrap">
              <Settings size={20} />
              {scraper?.isScraping && (
                <span className="mobile-nav-indicator-dot animate-pulse" />
              )}
            </div>
            <span className="mobile-nav-label">Tools</span>
          </button>
        </nav>

        {/* Mobile Utilities Menu Drawer in Stage 3 (Favorites/Recents/Systems) */}
        {isHamburgerOpen && (
          <div className="mobile-menu-backdrop animate-fade-in" onClick={() => setIsHamburgerOpen(false)}>
            <div className="mobile-menu-drawer animate-slide-up" onClick={(e) => e.stopPropagation()}>
              {/* Drawer Header */}
              <div className="mobile-menu-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span className="mobile-stage-badge" style={{ margin: 0 }}>TOOLS</span>
                  <strong style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}>Console Utilities</strong>
                </div>
                <button
                  type="button"
                  className="mobile-gate-close-btn"
                  onClick={() => { setIsHamburgerOpen(false); sfx?.playModalClose?.(); }}
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="mobile-menu-content">
                {/* Tool 1: Player Profiles & Account Management */}
                <div className="mobile-menu-card">
                  <div className="mobile-menu-card-header">
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                      <Users size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Player Profiles</strong>
                        <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', fontWeight: 700 }}>
                          {profiles.length} {profiles.length === 1 ? 'Profile' : 'Profiles'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        Create new players, customize avatars &amp; colors, or manage profiles
                      </span>
                    </div>
                  </div>

                  {/* Profiles List with Active / Edit / Delete */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem' }}>
                    {profiles.map(p => {
                      const isActive = p.id === activeProfileId;
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(148, 163, 184, 0.06)',
                            border: isActive ? '1.5px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(148, 163, 184, 0.18)'
                          }}
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
                            onClick={() => {
                              if (!isActive) {
                                onSelectProfile?.(p.id);
                                sfx?.playProfileSelect?.();
                                haptics.medium();
                              }
                            }}
                          >
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${p.favoriteColor || '#6366f1'}` }}>
                              <MultiAvatar seed={p.avatarSeed || p.name || 'Player'} size={26} />
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 800 : 600, color: 'var(--text-main)' }}>
                              {p.name}
                            </span>
                            {isActive && (
                              <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.06rem 0.3rem', borderRadius: '3px', background: '#6366f1', color: '#fff' }}>
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button
                              type="button"
                              className="mobile-prof-btn"
                              onClick={() => {
                                setIsHamburgerOpen(false);
                                onEditProfile?.(p);
                                sfx?.playModalOpen?.();
                                haptics.medium();
                              }}
                              title={`Edit ${p.name}`}
                              aria-label={`Edit ${p.name}`}
                            >
                              <Edit3 size={12} />
                            </button>
                            {profiles.length > 1 && (
                              <button
                                type="button"
                                className="mobile-prof-btn is-delete"
                                onClick={() => {
                                  onDeleteProfile?.(p.id);
                                  sfx?.playDelete?.();
                                  haptics.selection();
                                }}
                                title={`Delete ${p.name}`}
                                aria-label={`Delete ${p.name}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mobile-menu-card-actions" style={{ marginTop: '0.45rem' }}>
                    <button
                      type="button"
                      className="mobile-menu-btn is-secondary"
                      onClick={() => {
                        setIsHamburgerOpen(false);
                        onCreateNewProfile?.();
                        sfx?.playModalOpen?.();
                        haptics.medium();
                      }}
                    >
                      <Plus size={14} />
                      <span>Create New Profile</span>
                    </button>
                  </div>
                </div>

                {/* Tool 2: Metadata Scraper Studio */}
                {scraper && (
                  <div className="mobile-menu-card">
                    <div className="mobile-menu-card-header">
                      <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                        <Sparkles size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Metadata Scraper Studio</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                          {scraper.isScraping ? `Scraping in progress: ${scraper.scrapeProgress.current} / ${scraper.scrapeProgress.total} games...` : 'Fetch official 3D box art & metadata from Libretro CDN'}
                        </span>
                      </div>
                    </div>

                    <div className="mobile-menu-card-actions">
                      {scraper.isScraping ? (
                        <button
                          type="button"
                          className="mobile-menu-btn is-danger"
                          onClick={() => {
                            scraper.stopScrape();
                            sfx?.playModalClose?.();
                            haptics.medium();
                          }}
                        >
                          <Square size={13} fill="currentColor" />
                          <span>Stop Scraping</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="mobile-menu-btn is-primary"
                          onClick={() => {
                            setIsHamburgerOpen(false);
                            if (onOpenScraperModal) {
                              onOpenScraperModal();
                            } else {
                              scraper.scrapeAll(undefined, true);
                            }
                            sfx?.playModalOpen?.();
                            haptics.medium();
                          }}
                        >
                          <Sparkles size={14} />
                          <span>Open Scraper Studio</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tool 3: Emulation Preferences & Auto-Resume Settings */}
                <div className="mobile-menu-card">
                  <div className="mobile-menu-card-header">
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      <Zap size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Auto-Resume on Launch</strong>
                        <button
                          type="button"
                          className={`ds-toggle-switch ${isAutoResumeEnabled ? 'is-active' : ''}`}
                          style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '12px',
                            background: isAutoResumeEnabled ? '#10b981' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                            padding: 0
                          }}
                          onClick={() => {
                            const nextVal = !isAutoResumeEnabled;
                            setIsAutoResumeEnabled(nextVal);
                            try {
                              localStorage.setItem('retro_auto_resume_enabled', nextVal ? 'true' : 'false');
                            } catch (e) { }
                            sfx?.playTabSwitch?.();
                            haptics.selection();
                          }}
                          aria-label="Toggle Auto-Resume"
                        >
                          <span
                            style={{
                              display: 'block',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              top: '3px',
                              left: isAutoResumeEnabled ? '21px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        {isAutoResumeEnabled ? 'Automatically prompts to resume your last session upon opening a game' : 'Always boot to game title screen (loads battery save normally)'}
                      </span>
                    </div>
                  </div>

                  {/* Haptic Feedback (Vibration) Toggle */}
                  <div className="mobile-menu-card-header" style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <Smartphone size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Haptic Touch &amp; Rumble</strong>
                        <button
                          type="button"
                          className={`ds-toggle-switch ${isHapticsEnabled ? 'is-active' : ''}`}
                          style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '12px',
                            background: isHapticsEnabled ? '#10b981' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                            padding: 0
                          }}
                          onClick={() => {
                            const nextVal = !isHapticsEnabled;
                            setIsHapticsEnabled(nextVal);
                            haptics.setPreference(nextVal);
                            if (nextVal) {
                              haptics.medium();
                            }
                            sfx?.playTabSwitch?.();
                          }}
                          aria-label="Toggle Haptic Touch"
                        >
                          <span
                            style={{
                              display: 'block',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              top: '3px',
                              left: isHapticsEnabled ? '21px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        {isHapticsEnabled ? 'Hardware-accelerated micro-vibrations for touches, tabs, virtual buttons & achievements' : 'Haptic feedback disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Theme Mode (Light / Dark) Toggle */}
                  {themeEngine && (
                    <div className="mobile-menu-card-header" style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                      <div className="mobile-menu-icon-wrap" style={{ background: themeEngine.colorMode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: themeEngine.colorMode === 'dark' ? '#818cf8' : '#d97706' }}>
                        {themeEngine.colorMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {themeEngine.colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                          </strong>
                          <button
                            type="button"
                            className={`ds-toggle-switch ${themeEngine.colorMode === 'dark' ? 'is-active' : ''}`}
                            style={{
                              width: '42px',
                              height: '24px',
                              borderRadius: '12px',
                              background: themeEngine.colorMode === 'dark' ? '#6366f1' : '#f59e0b',
                              border: 'none',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background 0.2s ease',
                              padding: 0
                            }}
                            onClick={() => {
                              themeEngine.toggleColorMode?.();
                              sfx?.playTabSwitch?.();
                              haptics.selection();
                            }}
                            aria-label={`Toggle theme (Current: ${themeEngine.colorMode === 'dark' ? 'Dark' : 'Light'})`}
                          >
                            <span
                              style={{
                                display: 'block',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                position: 'absolute',
                                top: '3px',
                                left: themeEngine.colorMode === 'dark' ? '21px' : '3px',
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                              }}
                            />
                          </button>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                          {themeEngine.colorMode === 'dark' ? 'Sleek OLED dark console palette active' : 'Bright daylight retro console palette active'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tool 4: Storage & Database Management Studio (Backup, Restore & Reset) */}
                <div className="mobile-menu-card">
                  <div className="mobile-menu-card-header">
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' }}>
                      <Database size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Data &amp; Storage Management</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        Export data snapshots, restore backups, and manage browser storage
                      </span>
                    </div>
                  </div>

                  <div className="mobile-menu-card-actions">
                    <button
                      type="button"
                      className="mobile-menu-btn is-primary"
                      onClick={() => {
                        setIsHamburgerOpen(false);
                        onOpenBackupModal?.();
                        sfx?.playModalOpen?.();
                        haptics.medium();
                      }}
                    >
                      <Database size={14} />
                      <span>Open Storage Studio</span>
                    </button>
                  </div>
                </div>

                {/* Tool 7: About & System Info */}
                <div className="mobile-menu-card">
                  <div className="mobile-menu-card-header">
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                      <Info size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>About Retro Player</strong>
                        <span className="info-version-badge" style={{ fontSize: '0.68rem', padding: '0.12rem 0.5rem' }}>v1.1.0</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        Emulation engines, GitHub repository, and system specifications
                      </span>
                    </div>
                  </div>

                  <div className="mobile-menu-card-actions">
                    <button
                      type="button"
                      className="mobile-menu-btn is-primary"
                      onClick={() => {
                        setIsHamburgerOpen(false);
                        onOpenAboutModal?.();
                        sfx?.playModalOpen?.();
                        haptics.medium();
                      }}
                    >
                      <Info size={14} />
                      <span>About &amp; Specifications</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: CHOOSE SYSTEM (DS Touch Console Cards Grid & Full Parity Topbar)
  // =========================================================================
  return (
    <div className="mobile-app-root stage-systems-root">
      {/* Hidden File Input for Custom ROM Loader */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        accept=".zip,.7z,.nes,.sfc,.smc,.snes,.z64,.n64,.v64,.gba,.gbc,.gb,.nds,.bin,.iso,.pbp,.chd,.cue,.md,.smd,.gen,.gg,.sms,.pce,.ngp,.ngc,.ws,.wsc,.a26,.a78,.jag,.vec,.lynx"
      />

      {/* Mobile Topbar: Brand & Profile --- Complete Parity Action Buttons Group */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-left-group">
          {/* Active Profile Pill with Avatar & Player Name */}
          <div
            className="mobile-topbar-profile"
            style={{ borderColor: activeProfile?.favoriteColor || '#e11d48' }}
            onClick={() => {
              setShowProfileSwitcher(true);
              sfx?.playModalOpen?.();
              haptics.medium();
            }}
            title={`Profile: ${activeProfile?.name || 'Player'} (Tap to switch)`}
          >
            <div className="mobile-topbar-profile-avatar-wrap">
              <MultiAvatar seed={activeProfile?.avatarSeed || activeProfile?.name || 'Player'} size={24} />
            </div>
            <span className="mobile-topbar-profile-name">{activeProfile?.name || 'Player'}</span>
          </div>
        </div>

        {/* Right Icon Actions Group */}
        <div className="mobile-topbar-actions-group">
          {/* 1. Gamepad & Battery Telemetry Pill (Shown only when connected, before search) */}
          {gamepadConnected && (
            <div
              className={`mobile-topbar-action-btn mobile-gamepad-pill is-connected ${gamepadBattery?.hasBatteryInfo && gamepadBattery.batteryPercent <= 10 && !gamepadBattery.isCharging ? 'is-battery-critical' : gamepadBattery?.hasBatteryInfo && gamepadBattery.batteryPercent <= 20 && !gamepadBattery.isCharging ? 'is-battery-low' : ''}`}
              title={getGamepadTooltip()}
            >
              <Gamepad2 size={16} />
              {gamepadBattery?.hasBatteryInfo && (
                <span className="mobile-battery-indicator">
                  {renderBatteryIcon()}
                  <span style={{ fontSize: '0.66rem', fontWeight: 900 }}>{gamepadBattery.batteryPercent}%</span>
                </span>
              )}
            </div>
          )}

          {/* 2. Search Icon Button */}
          <button
            type="button"
            className={`mobile-topbar-action-btn ${isSearchOpen || searchQuery ? 'is-active' : ''}`}
            onClick={() => {
              setIsSearchOpen(prev => !prev);
              sfx?.playTileNav?.();
              haptics.selection();
            }}
            title="Search Library"
            aria-label="Search Library"
          >
            <Search size={16} />
          </button>

          {/* 3. BGM Toggle Button & Prev/Skip Buttons */}
          {bgm && (
            <div className="mobile-bgm-group" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {bgm.isPlaying && (
                <button
                  type="button"
                  className="mobile-topbar-action-btn mobile-bgm-prev-btn"
                  onClick={() => {
                    bgm.prevTrack();
                    if (bgm.currentTrack) {
                      achievementsEngine?.triggerBgmTrackPlayed?.(bgm.currentTrack.title || bgm.currentTrack.url);
                    }
                    sfx?.playTabSwitch?.();
                    haptics.selection();
                  }}
                  title="Previous BGM Track"
                  aria-label="Previous BGM Track"
                  style={{ width: '28px', height: '28px' }}
                >
                  <SkipBack size={12} color="#94a3b8" />
                </button>
              )}

              <button
                type="button"
                className={`mobile-topbar-action-btn ${bgm.isPlaying ? 'is-active is-playing' : ''}`}
                onClick={() => {
                  bgm.togglePlay();
                  if (!bgm.isPlaying && bgm.currentTrack) {
                    achievementsEngine?.triggerBgmTrackPlayed?.(bgm.currentTrack.title || bgm.currentTrack.url);
                  }
                  sfx?.playTileNav?.();
                  haptics.selection();
                }}
                title={bgm.currentTrack ? `BGM: ${bgm.currentTrack.title} (${bgm.isPlaying ? 'Playing' : 'Paused'})` : "Toggle BGM"}
                aria-label="Toggle Background Music"
              >
                <Music size={16} color={bgm.isPlaying ? '#10b981' : '#64748b'} className={bgm.isPlaying ? 'pulse-icon' : ''} />
              </button>

              {bgm.isPlaying && (
                <button
                  type="button"
                  className="mobile-topbar-action-btn mobile-bgm-skip-btn"
                  onClick={() => {
                    bgm.nextTrack();
                    if (bgm.currentTrack) {
                      achievementsEngine?.triggerBgmTrackPlayed?.(bgm.currentTrack.title || bgm.currentTrack.url);
                    }
                    sfx?.playTabSwitch?.();
                    haptics.selection();
                  }}
                  title="Next BGM Track"
                  aria-label="Next BGM Track"
                  style={{ width: '28px', height: '28px' }}
                >
                  <SkipForward size={12} color="#94a3b8" />
                </button>
              )}
            </div>
          )}


          {/* 5. Load Custom ROM Button */}
          <button
            type="button"
            className="mobile-topbar-action-btn load-action-btn"
            onClick={() => {
              setShowLoadRomModal?.(true);
              sfx?.playModalOpen?.();
              haptics.medium();
            }}
            title="Load Custom ROM"
            aria-label="Load Custom ROM"
          >
            <FolderOpen size={16} color="#3b82f6" />
          </button>

          {/* 6. PWA Install App Action (Shown only if not already installed) */}
          {pwa?.canInstall && (
            <button
              type="button"
              className="mobile-topbar-action-btn pwa-install-action-btn"
              onClick={() => {
                pwa.promptInstall();
                sfx?.playThemeSwitch?.();
              }}
              title="Install App (PWA)"
              aria-label="Install App (PWA)"
            >
              <Download size={16} color="#10b981" />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Hamburger Utilities Menu Drawer */}
      {isHamburgerOpen && (
        <div className="mobile-menu-backdrop animate-fade-in" onClick={() => setIsHamburgerOpen(false)}>
          <div className="mobile-menu-drawer animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="mobile-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span className="mobile-stage-badge" style={{ margin: 0 }}>TOOLS</span>
                <strong style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}>Console Utilities</strong>
              </div>
              <button
                type="button"
                className="mobile-gate-close-btn"
                onClick={() => { setIsHamburgerOpen(false); sfx?.playModalClose?.(); }}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="mobile-menu-content">
              {/* Tool 1: Player Profiles & Account Management */}
              <div className="mobile-menu-card">
                <div className="mobile-menu-card-header">
                  <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                    <Users size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Player Profiles</strong>
                      <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', fontWeight: 700 }}>
                        {profiles.length} {profiles.length === 1 ? 'Profile' : 'Profiles'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                      Create new players, customize avatars &amp; colors, or manage profiles
                    </span>
                  </div>
                </div>

                {/* Profiles List with Active / Edit / Delete */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem' }}>
                  {profiles.map(p => {
                    const isActive = p.id === activeProfileId;
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(148, 163, 184, 0.06)',
                          border: isActive ? '1.5px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(148, 163, 184, 0.18)'
                        }}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
                          onClick={() => {
                            if (!isActive) {
                              onSelectProfile?.(p.id);
                              sfx?.playProfileSelect?.();
                            }
                          }}
                        >
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', overflow: 'hidden', border: `1.5px solid ${p.favoriteColor || '#6366f1'}` }}>
                            <MultiAvatar seed={p.avatarSeed || p.name || 'Player'} size={26} />
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 800 : 600, color: 'var(--text-main)' }}>
                            {p.name}
                          </span>
                          {isActive && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '0.06rem 0.3rem', borderRadius: '3px', background: '#6366f1', color: '#fff' }}>
                              ACTIVE
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            type="button"
                            className="mobile-prof-btn"
                            onClick={() => {
                              setIsHamburgerOpen(false);
                              onEditProfile?.(p);
                              sfx?.playModalOpen?.();
                            }}
                            title={`Edit ${p.name}`}
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit3 size={12} />
                          </button>
                          {profiles.length > 1 && (
                            <button
                              type="button"
                              className="mobile-prof-btn is-delete"
                              onClick={() => {
                                onDeleteProfile?.(p.id);
                                sfx?.playDelete?.();
                              }}
                              title={`Delete ${p.name}`}
                              aria-label={`Delete ${p.name}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mobile-menu-card-actions" style={{ marginTop: '0.45rem' }}>
                  <button
                    type="button"
                    className="mobile-menu-btn is-secondary"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      onCreateNewProfile?.();
                      sfx?.playModalOpen?.();
                    }}
                  >
                    <Plus size={14} />
                    <span>Create New Profile</span>
                  </button>
                </div>
              </div>

              {/* Tool 2: Metadata Scraper Studio */}
              {scraper && (
                <div className="mobile-menu-card">
                  <div className="mobile-menu-card-header">
                    <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                      <Disc size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Metadata Scraper Studio</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        {scraper.isScraping ? `Scraping in progress: ${scraper.scrapeProgress.current} / ${scraper.scrapeProgress.total} games...` : 'Fetch official 3D box art & metadata from Libretro CDN'}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-menu-card-actions">
                    {scraper.isScraping ? (
                      <button
                        type="button"
                        className="mobile-menu-btn is-danger"
                        onClick={() => {
                          scraper.stopScrape();
                          sfx?.playModalClose?.();
                        }}
                      >
                        <Square size={13} fill="currentColor" />
                        <span>Stop Scraping</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="mobile-menu-btn is-primary"
                        onClick={() => {
                          setIsHamburgerOpen(false);
                          if (onOpenScraperModal) {
                            onOpenScraperModal();
                          } else {
                            scraper.scrapeAll(undefined, true);
                          }
                          sfx?.playModalOpen?.();
                        }}
                      >
                        <Disc size={14} />
                        <span>Open Scraper Studio</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tool 4: Emulation Preferences & Auto-Resume Settings */}
              <div className="mobile-menu-card">
                <div className="mobile-menu-card-header">
                  <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                    <Zap size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Auto-Resume on Launch</strong>
                      <button
                        type="button"
                        className={`ds-toggle-switch ${isAutoResumeEnabled ? 'is-active' : ''}`}
                        style={{
                          width: '42px',
                          height: '24px',
                          borderRadius: '12px',
                          background: isAutoResumeEnabled ? '#10b981' : '#64748b',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s ease',
                          padding: 0
                        }}
                        onClick={() => {
                          const nextVal = !isAutoResumeEnabled;
                          setIsAutoResumeEnabled(nextVal);
                          try {
                            localStorage.setItem('retro_auto_resume_enabled', nextVal ? 'true' : 'false');
                          } catch (e) { }
                          sfx?.playTabSwitch?.();
                        }}
                        aria-label="Toggle Auto-Resume"
                      >
                        <span
                          style={{
                            display: 'block',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            position: 'absolute',
                            top: '3px',
                            left: isAutoResumeEnabled ? '21px' : '3px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                        />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                      {isAutoResumeEnabled ? 'Automatically prompts to resume your last session upon opening a game' : 'Always boot to game title screen (loads battery save normally)'}
                    </span>
                  </div>
                </div>

                {/* Haptic Feedback (Vibration) Toggle */}
                <div className="mobile-menu-card-header" style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                  <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <Smartphone size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Haptic Touch &amp; Rumble</strong>
                      <button
                        type="button"
                        className={`ds-toggle-switch ${isHapticsEnabled ? 'is-active' : ''}`}
                        style={{
                          width: '42px',
                          height: '24px',
                          borderRadius: '12px',
                          background: isHapticsEnabled ? '#10b981' : '#64748b',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s ease',
                          padding: 0
                        }}
                        onClick={() => {
                          const nextVal = !isHapticsEnabled;
                          setIsHapticsEnabled(nextVal);
                          haptics.setPreference(nextVal);
                          if (nextVal) {
                            haptics.medium();
                          }
                          sfx?.playTabSwitch?.();
                        }}
                        aria-label="Toggle Haptic Touch"
                      >
                        <span
                          style={{
                            display: 'block',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            position: 'absolute',
                            top: '3px',
                            left: isHapticsEnabled ? '21px' : '3px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                        />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                      {isHapticsEnabled ? 'Hardware-accelerated micro-vibrations for touches, tabs, virtual buttons & achievements' : 'Haptic feedback disabled'}
                    </span>
                  </div>
                </div>

                {/* Theme Mode (Light / Dark) Toggle */}
                {themeEngine && (
                  <div className="mobile-menu-card-header" style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <div className="mobile-menu-icon-wrap" style={{ background: themeEngine.colorMode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: themeEngine.colorMode === 'dark' ? '#818cf8' : '#d97706' }}>
                      {themeEngine.colorMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {themeEngine.colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </strong>
                        <button
                          type="button"
                          className={`ds-toggle-switch ${themeEngine.colorMode === 'dark' ? 'is-active' : ''}`}
                          style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '12px',
                            background: themeEngine.colorMode === 'dark' ? '#6366f1' : '#f59e0b',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                            padding: 0
                          }}
                          onClick={() => {
                            themeEngine.toggleColorMode?.();
                            sfx?.playTabSwitch?.();
                            haptics.selection();
                          }}
                          aria-label={`Toggle theme (Current: ${themeEngine.colorMode === 'dark' ? 'Dark' : 'Light'})`}
                        >
                          <span
                            style={{
                              display: 'block',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              top: '3px',
                              left: themeEngine.colorMode === 'dark' ? '21px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        {themeEngine.colorMode === 'dark' ? 'Sleek OLED dark console palette active' : 'Bright daylight retro console palette active'}
                      </span>
                    </div>
                  </div>
                )}

                {/* UI Sound Effects Synthesizer Toggle */}
                {sfx && (
                  <div className="mobile-menu-card-header" style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <div className="mobile-menu-icon-wrap" style={{ background: !sfx.isMuted ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)', color: !sfx.isMuted ? '#3b82f6' : '#64748b' }}>
                      {!sfx.isMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          UI Sound Effects
                        </strong>
                        <button
                          type="button"
                          className={`ds-toggle-switch ${!sfx.isMuted ? 'is-active' : ''}`}
                          style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '12px',
                            background: !sfx.isMuted ? '#3b82f6' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                            padding: 0
                          }}
                          onClick={() => {
                            sfx.toggleMute();
                            haptics.selection();
                          }}
                          aria-label={`Toggle UI Sound Effects (Current: ${sfx.isMuted ? 'Muted' : 'Enabled'})`}
                        >
                          <span
                            style={{
                              display: 'block',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              position: 'absolute',
                              top: '3px',
                              left: !sfx.isMuted ? '21px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                        {!sfx.isMuted ? 'Tactile 8-bit & 16-bit acoustic feedback for menu navigation and actions' : 'Synthesized UI sound effects muted'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tool 5: Storage & Database Management Studio (Backup, Restore & Reset) */}
              <div className="mobile-menu-card">
                <div className="mobile-menu-card-header">
                  <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' }}>
                    <Database size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>Data &amp; Storage Management</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                      Export data snapshots, restore backups, and manage browser storage
                    </span>
                  </div>
                </div>

                <div className="mobile-menu-card-actions">
                  <button
                    type="button"
                    className="mobile-menu-btn is-primary"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      onOpenBackupModal?.();
                      sfx?.playModalOpen?.();
                      haptics.medium();
                    }}
                  >
                    <Database size={14} />
                    <span>Open Storage Studio</span>
                  </button>
                </div>
              </div>



              {/* Tool 7: About & System Info */}
              <div className="mobile-menu-card">
                <div className="mobile-menu-card-header">
                  <div className="mobile-menu-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                    <Info size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <strong style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>About Retro Player</strong>
                      <span className="info-version-badge" style={{ fontSize: '0.68rem', padding: '0.12rem 0.5rem' }}>v1.1.0</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35 }}>
                      Emulation engines, GitHub repository, and system specifications
                    </span>
                  </div>
                </div>

                <div className="mobile-menu-card-actions">
                  <button
                    type="button"
                    className="mobile-menu-btn is-primary"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      onOpenAboutModal?.();
                      sfx?.playModalOpen?.();
                      haptics.medium();
                    }}
                  >
                    <Info size={14} />
                    <span>About &amp; Specifications</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Search Bar Below Topbar */}
      {isSearchOpen && (
        <div className="mobile-expandable-search-bar animate-fade-in">
          <div className="mobile-search-widget">
            <Search size={16} className="mobile-search-icon" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search all games..."
              value={searchQuery}
              autoFocus
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="mobile-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Systems Stage Body */}
      <main className="mobile-systems-body">
        {searchQuery.trim().length > 0 ? (
          /* Live Search Results View (Search bar remains continuously mounted) */
          <div className="mobile-search-results-section animate-fade-in">
            <div className="mobile-systems-header">
              <div className="mobile-systems-header-left">
                <h2 className="mobile-systems-title">Search Results</h2>
              </div>
              <div className="mobile-total-games-badge">
                <Gamepad2 size={13} />
                <span>{currentGamesList.length} Found</span>
              </div>
            </div>

            {currentGamesList.length > 0 ? (
              <div className="mobile-ds-buttons-grid">
                {currentGamesList.map((game, idx) => {
                  const meta = metadataMap[game.id] || metadataMap[`${game.systemKey}-${game.title}`.toLowerCase().replace(/[^a-z0-9]/g, '-')];
                  const isFav = isFavorite ? isFavorite(game.id || game.title) : false;
                  const rawThumb = meta?.coverUrl || (game.coverUrl && !game.coverUrl.endsWith('.svg') ? game.coverUrl : null);
                  const thumbSrc = rawThumb ? resolveAssetPath(rawThumb) : null;

                  return (
                    <button
                      key={game.id || idx}
                      type="button"
                      className={`ds-touch-btn ${isFav ? 'is-fav' : ''}`}
                      onClick={() => {
                        setSelectedGameForDetails(game);
                        sfx?.playTileNav?.();
                      }}
                      title={game.title}
                    >
                      {thumbSrc ? (
                        <img src={thumbSrc} alt={game.title} className="ds-btn-thumb" loading="lazy" />
                      ) : (
                        <span className="ds-btn-text">{game.title}</span>
                      )}
                      {isFav && <span className="ds-fav-dot">★</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mobile-empty-catalog">
                <FolderOpen size={48} color="#64748b" />
                <h3>No Games Found</h3>
                <p>No ROM files found matching &quot;{searchQuery}&quot;.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Stage Header Banner */}
            <div className="mobile-systems-header">
              <div className="mobile-systems-header-left">
                <h2 className="mobile-systems-title">Choose System</h2>
              </div>
              <div className="mobile-total-games-badge">
                <Gamepad2 size={13} />
                <span>{games.length} Titles</span>
              </div>
            </div>

            {/* Quick Access Smart Categories */}
            {games.length === 0 && (
              <div className="mobile-empty-library-card" style={{
                margin: '0.5rem 0 0.85rem 0',
                padding: '1.1rem 1rem',
                background: 'var(--panel-bg, #ffffff)',
                border: '2px dashed var(--panel-border, #cbd5e1)',
                borderRadius: '12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FolderOpen size={32} color="#3b82f6" />
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main, #0f172a)' }}>No ROMs in Library</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub, #64748b)', maxWidth: '280px', lineHeight: 1.4 }}>
                  Load ROM files (.gba, .nes, .gbc, .nds, .zip) from your device to start playing immediately.
                </div>
                <button
                  type="button"
                  className="mobile-ds-play-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    marginTop: '4px',
                    background: '#3b82f6',
                    borderColor: '#2563eb'
                  }}
                  onClick={() => {
                    setShowLoadRomModal?.(true);
                    sfx?.playModalOpen?.();
                  }}
                >
                  <FolderOpen size={15} />
                  <span>Load Custom ROM</span>
                </button>
              </div>
            )}
            <div className="mobile-quick-categories-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
              <button
                type="button"
                className="mobile-quick-cat-card is-all"
                onClick={() => {
                  setSelectedSystem({ key: 'all', name: 'All Games', icon: 'assets/platforms/gba.svg' });
                  sfx?.playTabSwitch?.();
                  haptics.selection();
                }}
              >
                <Layers size={18} color="#e11d48" />
                <div className="mobile-quick-cat-text">
                  <strong>All Games</strong>
                  <span>Browse complete library ({games.length} titles)</span>
                </div>
                <ChevronRight size={16} className="mobile-quick-arrow" />
              </button>
            </div>

            {/* DS Touch Console Cards Grid */}
            <div className="mobile-console-cards-grid">
              {systems.map((sys) => {
                const count = systemGamesMap[sys.key]?.length || 0;
                return (
                  <div
                    key={sys.key}
                    className="mobile-console-card"
                    style={{ '--sys-accent': sys.color || '#e11d48' }}
                    onClick={() => {
                      setSelectedSystem(sys);
                      sfx?.playTabSwitch?.();
                      haptics.selection();
                    }}
                  >
                    {/* Visual SVG Console Header */}
                    <div className="mobile-console-art-wrap">
                      {sys.icon ? (
                        <img
                          src={resolveAssetPath(sys.icon)}
                          alt={sys.name}
                          className="mobile-console-svg-img"
                        />
                      ) : (
                        <Gamepad2 size={42} color={sys.color || '#64748b'} />
                      )}
                    </div>

                    {/* Info Footer */}
                    <div className="mobile-console-card-footer">
                      <div className="mobile-console-text-wrap">
                        <span className="mobile-console-name">{sys.name}</span>
                        <span className="mobile-console-category">{sys.category || 'Console'}</span>
                      </div>
                      <span className="mobile-console-count-pill">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Modern Console-Grade Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav-bar" aria-label="Main Mobile Navigation">
        {/* Tab 1: All Games / Library */}
        <button
          type="button"
          className={`mobile-nav-tab ${selectedSystem?.key === 'all' && !isHamburgerOpen ? 'is-active' : ''}`}
          onClick={() => {
            if (isHamburgerOpen) setIsHamburgerOpen(false);
            setSelectedSystem({ key: 'all', name: 'All Games', icon: 'assets/platforms/gba.svg' });
            sfx?.playTabSwitch?.();
            haptics.selection();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Library - All Games"
        >
          <div className="mobile-nav-icon-wrap">
            <Gamepad2 size={20} />
          </div>
          <span className="mobile-nav-label">Library</span>
        </button>

        {/* Tab 2: Favorites */}
        <button
          type="button"
          className={`mobile-nav-tab ${selectedSystem?.key === 'favorites' && !isHamburgerOpen ? 'is-active' : ''}`}
          onClick={() => {
            if (isHamburgerOpen) setIsHamburgerOpen(false);
            setSelectedSystem({ key: 'favorites', name: 'Favorites', icon: null });
            sfx?.playTabSwitch?.();
            haptics.selection();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Favorites"
        >
          <div className="mobile-nav-icon-wrap">
            <Star size={20} fill={selectedSystem?.key === 'favorites' && !isHamburgerOpen ? '#f59e0b' : 'none'} color={selectedSystem?.key === 'favorites' && !isHamburgerOpen ? '#f59e0b' : 'currentColor'} />
          </div>
          <span className="mobile-nav-label">Favorites</span>
        </button>

        {/* Tab 3: Recent */}
        <button
          type="button"
          className={`mobile-nav-tab ${selectedSystem?.key === 'recent' && !isHamburgerOpen ? 'is-active' : ''}`}
          onClick={() => {
            if (isHamburgerOpen) setIsHamburgerOpen(false);
            setSelectedSystem({ key: 'recent', name: 'Recently Played', icon: null });
            sfx?.playTabSwitch?.();
            haptics.selection();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Recently Played Games"
        >
          <div className="mobile-nav-icon-wrap">
            <Clock size={20} />
          </div>
          <span className="mobile-nav-label">Recent</span>
        </button>

        {/* Tab 4: Trophies / Hall of Fame */}
        <button
          type="button"
          className="mobile-nav-tab"
          onClick={() => {
            if (isHamburgerOpen) setIsHamburgerOpen(false);
            onOpenTrophyModal?.();
            sfx?.playModalOpen?.();
            haptics.medium();
          }}
          aria-label="Trophy Cabinet & Achievements"
        >
          <div className="mobile-nav-icon-wrap">
            <Trophy size={20} color="#f59e0b" />
          </div>
          <span className="mobile-nav-label">Trophies</span>
        </button>

        {/* Tab 5: Tools & System Utilities (Opens Bottom Drawer) */}
        <button
          type="button"
          className={`mobile-nav-tab ${isHamburgerOpen ? 'is-active' : ''}`}
          onClick={() => {
            setIsHamburgerOpen(prev => !prev);
            sfx?.playTileNav?.();
            haptics.medium();
          }}
          aria-label="Console Utilities & Settings"
        >
          <div className="mobile-nav-icon-wrap">
            <Settings size={20} />
            {scraper?.isScraping && (
              <span className="mobile-nav-indicator-dot animate-pulse" />
            )}
          </div>
          <span className="mobile-nav-label">Tools</span>
        </button>
      </nav>
    </div>
  );
}
