import { useState, useEffect, useMemo, useCallback } from 'react';
import { getReleaseDate } from '../gameDescriptions';
import { detectSystemFromExtension } from '../utils/systemDetector';

/**
 * Hook to manage ROM catalog manifest, search filtering, system categories, and custom ROM uploads.
 */
export function useRomManifest(onCustomRomLoaded) {
  const [games, setGames] = useState([]);
  const [systems, setSystems] = useState([]);
  const [activeSystem, setActiveSystem] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    console.log('📡 [CLIENT FETCH] Requesting ROM manifest from /api/roms...');
    try {
      const res = await fetch('/api/roms');
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [CLIENT FETCH SUCCESS] Indexed ${data.games?.length || 0} games across ${data.systems?.length || 0} systems.`);
        setGames(data.games || []);
        setSystems(data.systems || []);
      } else {
        console.error(`🚨 [CLIENT FETCH API ERROR] Server responded with HTTP status ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.error('🚨 [CLIENT FETCH NETWORK ERROR] Failed fetching games from server:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const processCustomRomFile = useCallback((file) => {
    if (!file) return;
    console.log(`📁 [CUSTOM ROM LOADED] File: "${file.name}" | Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    const sys = detectSystemFromExtension(file.name);
    const blobUrl = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

    const customGame = {
      id: `custom_${Date.now()}_${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      title: `${cleanTitle} (Custom)`,
      rawTitle: cleanTitle,
      filename: file.name,
      file: file,
      systemKey: sys.key,
      systemName: sys.name,
      systemCore: sys.core,
      systemIcon: sys.icon,
      systemColor: sys.color,
      romUrl: blobUrl,
      isCustomBlob: true,
      coverUrl: sys.icon || '/assets/pokeball.png'
    };

    if (onCustomRomLoaded) {
      onCustomRomLoaded(customGame);
    }
  }, [onCustomRomLoaded]);

  const handleCustomRomSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processCustomRomFile(file);
    }
    e.target.value = '';
  }, [processCustomRomFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processCustomRomFile(file);
    }
  }, [processCustomRomFile]);

  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (game.systemName && game.systemName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSystem = activeSystem === 'all' || game.systemKey === activeSystem;
        return matchesSearch && matchesSystem;
      })
      .sort((a, b) => {
        const dateA = getReleaseDate(a);
        const dateB = getReleaseDate(b);
        return dateA.localeCompare(dateB);
      });
  }, [games, searchQuery, activeSystem]);

  return {
    games,
    systems,
    activeSystem,
    setActiveSystem,
    searchQuery,
    setSearchQuery,
    loading,
    filteredGames,
    isDraggingOver,
    fetchGames,
    processCustomRomFile,
    handleCustomRomSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
