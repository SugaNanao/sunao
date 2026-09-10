import React, { useState, useEffect } from 'react';
import { ActiveTab, CoupleSiteData, ChatMessage, ChatConversationGroup } from './types';
import { loadCoupleData, saveCoupleData, generateShareableUrl, isSharedUrl, loadCoupleDataFromIndexedDB } from './utils/storage';
import { soundPlayer } from './utils/audioSynth';
import { LoadingScreen } from './components/LoadingScreen';
import { CoverScreen } from './components/CoverScreen';
import { DesktopHeader } from './components/DesktopHeader';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { HomeView } from './components/views/HomeView';
import { CharacterProfileView } from './components/views/CharacterProfileView';
import { StoryView } from './components/views/StoryView';
import { AlbumView } from './components/views/AlbumView';
import { AUView } from './components/views/AUView';
import { ChatModal } from './components/ChatModal';
import { MusicModal } from './components/MusicModal';
import { EditModal } from './components/EditModal';
import { ShareModal } from './components/ShareModal';
import { TaskBar } from './components/TaskBar';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { AdminAuthModal } from './components/AdminAuthModal';

export default function App() {
  const [data, setData] = useState<CoupleSiteData>(loadCoupleData);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoverView, setIsCoverView] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('HOME');
  
  // Shared link detection: when shared, permanently enforce Guest Mode
  const [isSharedLink] = useState<boolean>(() => isSharedUrl());

  // Admin authentication: Default is false (Visitor Mode) for all public users on Vercel!
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const adminParam = params.get('admin');
      const customPwd = localStorage.getItem('love_archive_admin_custom_pwd') || 'sugananao24222';
      if (adminParam === '1' || adminParam === 'true' || adminParam === customPwd || adminParam === 'sugananao24222') {
        localStorage.setItem('love_archive_admin_auth', 'true');
        return true;
      }
      return localStorage.getItem('love_archive_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState('basic');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [fontMode, setFontMode] = useState<'pixel' | 'rounded' | 'clean'>(() => {
    try {
      const saved = localStorage.getItem('love_archive_font_mode');
      if (saved === 'rounded' || saved === 'clean' || saved === 'pixel') {
        return saved;
      }
    } catch {}
    return 'pixel';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-font-mode', fontMode);
      localStorage.setItem('love_archive_font_mode', fontMode);
    } catch {}
  }, [fontMode]);

  const handleCycleFontMode = () => {
    setFontMode((prev) => (prev === 'pixel' ? 'rounded' : prev === 'rounded' ? 'clean' : 'pixel'));
  };

  // If ?admin=1 is in URL and not logged in yet, prompt the modal automatically
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1' && !isAdmin) {
        setIsAdminModalOpen(true);
      }
    } catch {}
  }, [isAdmin]);

  // Sync music play state
  useEffect(() => {
    soundPlayer.onPlayStateChange((playing) => {
      setIsPlayingMusic(playing);
    });
  }, []);

  // Hydrate full data from IndexedDB if not on a shared snapshot link
  useEffect(() => {
    if (!isSharedLink) {
      loadCoupleDataFromIndexedDB().then((dbData) => {
        if (dbData) {
          setData(dbData);
        }
      }).catch(() => {});
    }
  }, [isSharedLink]);

  // Effective visitor mode: visitor mode is active whenever user is NOT admin or is viewing a shared link
  const isVisitor = !isAdmin || isSharedLink;
  const effectiveEditMode = isAdmin && isEditMode && !isSharedLink;

  const handleToggleEditMode = () => {
    // Only authenticated admin can toggle edit mode
    if (isVisitor) return;
    setIsEditMode((prev) => !prev);
  };

  const handleAdminLogin = (password: string): boolean => {
    const customPwd = localStorage.getItem('love_archive_admin_custom_pwd') || 'sugananao24222';
    if (password === customPwd || password === 'sugananao24222') {
      setIsAdmin(true);
      setIsEditMode(true);
      localStorage.setItem('love_archive_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsEditMode(false);
    localStorage.removeItem('love_archive_admin_auth');
  };

  const handleUpdateData = (newData: CoupleSiteData) => {
    setData(newData);
    saveCoupleData(newData);
  };

  const handleUpdateChat = (messages: ChatMessage[]) => {
    const next = { ...data, chatHistory: messages };
    setData(next);
    saveCoupleData(next);
  };

  const handleUpdateChatGroups = (groups: ChatConversationGroup[]) => {
    const next = { ...data, chatGroups: groups };
    setData(next);
    saveCoupleData(next);
  };

  const handleToggleMusic = () => {
    soundPlayer.toggle();
    setIsPlayingMusic(soundPlayer.getIsPlaying());
  };

  const handleOpenEditSection = (section: string) => {
    if (isVisitor) return;
    setEditInitialTab(section);
    setIsEditModalOpen(true);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
    const url = generateShareableUrl(data);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }).catch(() => {});
  };

  // 1. Loading screen
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  // 2. Cover Screen (Click anywhere to enter main site)
  if (isCoverView) {
    return (
      <CoverScreen
        data={data}
        onEnter={() => setIsCoverView(false)}
      />
    );
  }

  // 3. Main Desktop Website
  return (
    <div
      data-font-mode={fontMode}
      className="min-h-screen dot-bg pb-14 text-[#442F2A] flex flex-col selection:bg-[#E0BAC7] selection:text-[#442F2A]"
    >
      {/* Top Header with Category Navigation (Only show when in Edit Mode across ALL tabs) */}
      {!effectiveEditMode ? (
        <div className="w-full h-[58px] sm:h-[62px] pointer-events-none select-none" aria-hidden="true" />
      ) : (
        <DesktopHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isEditMode={effectiveEditMode}
          onToggleEditMode={handleToggleEditMode}
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={handleToggleMusic}
          onOpenMusicModal={() => setIsMusicModalOpen(true)}
          onOpenEditModal={() => handleOpenEditSection('basic')}
          onReturnToCover={() => setIsCoverView(true)}
          onShare={handleShare}
          data={data}
          isSharedLink={isSharedLink}
          isAdmin={isAdmin}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
        />
      )}

      {/* Share Toast Notification */}
      {copiedNotice && (
        <div className="fixed top-16 right-4 z-50 bg-[#442F2A] text-[#FFF8F5] px-4 py-2 rounded-md font-pixel text-xs border border-[#C89398] shadow-lg animate-fade-in flex items-center gap-2">
          <span className="text-[#C89398]">♥</span>
          <span>專屬戀愛紀錄分享連結已複製到剪貼簿！</span>
        </div>
      )}

      {/* Main OS Desktop Layout Grid */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex-1 flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Column Sidebar */}
        <LeftSidebar
          data={data}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isEditMode={effectiveEditMode}
          onEditSection={handleOpenEditSection}
        />

        {/* Center Main Stage Area (Router Views) */}
        <div className="flex-1 w-full min-w-0" id="main-content-view">
          {activeTab === 'HOME' && (
            <HomeView
              data={data}
              onNavigateTab={setActiveTab}
              isEditMode={effectiveEditMode}
              onEditSection={handleOpenEditSection}
              onOpenMusicModal={() => setIsMusicModalOpen(true)}
              onOpenChat={() => setIsChatOpen(true)}
            />
          )}

          {(activeTab === 'CHARACTER' || activeTab === 'CHARACTER PROFILE') && (
            <CharacterProfileView
              data={data}
              isEditMode={effectiveEditMode}
              onEditSection={handleOpenEditSection}
            />
          )}

          {activeTab === 'STORY' && (
            <StoryView
              data={data}
              isEditMode={effectiveEditMode}
              onEditSection={handleOpenEditSection}
            />
          )}

          {activeTab === 'ALBUM' && (
            <AlbumView
              data={data}
              isEditMode={effectiveEditMode}
              onEditSection={handleOpenEditSection}
            />
          )}

          {(activeTab === 'AU' || activeTab === 'ALTERNATIVE UNIVERSE') && (
            <AUView
              data={data}
              isEditMode={effectiveEditMode}
              onEditSection={handleOpenEditSection}
            />
          )}
        </div>

        {/* Right Column Widgets */}
        <RightSidebar
          data={data}
          onOpenChat={() => setIsChatOpen(true)}
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={handleToggleMusic}
          isEditMode={effectiveEditMode}
          onEditSection={handleOpenEditSection}
        />
      </main>

      {/* Floating Music Player Window */}
      <FloatingMusicPlayer
        isPlaying={isPlayingMusic}
        onTogglePlay={handleToggleMusic}
        onOpenMusicModal={() => setIsMusicModalOpen(true)}
      />

      {/* Modals */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        data={data}
        isEditMode={effectiveEditMode}
        isSharedLink={isVisitor}
        onUpdateChatHistory={handleUpdateChat}
        onUpdateChatGroups={handleUpdateChatGroups}
      />

      <MusicModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        isPlaying={isPlayingMusic}
        onTogglePlay={handleToggleMusic}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        data={data}
        onSaveData={handleUpdateData}
        initialTab={editInitialTab}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={data}
        onImportData={handleUpdateData}
      />

      {/* Admin Authentication & Console Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        data={data}
        onImportData={handleUpdateData}
      />

      {/* Bottom Retro TaskBar with HOME button & Admin trigger */}
      <TaskBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        isEditMode={effectiveEditMode}
        onToggleEditMode={handleToggleEditMode}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onAdminLogout={handleAdminLogout}
        fontMode={fontMode}
        onCycleFontMode={handleCycleFontMode}
      />
    </div>
  );
}
