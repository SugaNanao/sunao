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

export default function App() {
  const [data, setData] = useState<CoupleSiteData>(loadCoupleData);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoverView, setIsCoverView] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('HOME');
  
  // Shared link detection: when shared, permanently enforce Guest Mode
  const [isSharedLink] = useState<boolean>(() => isSharedUrl());
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState('basic');
  const [copiedNotice, setCopiedNotice] = useState(false);

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

  const handleToggleEditMode = () => {
    // If shared, strictly prevent switching to edit mode
    if (isSharedLink) return;
    setIsEditMode((prev) => !prev);
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
    if (isSharedLink) return;
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
    <div className="min-h-screen dot-bg pb-14 text-[#442F2A] flex flex-col selection:bg-[#E0BAC7] selection:text-[#442F2A]">
      {/* Top Header with Category Navigation (Preserve blank space on HOME page in shared visitor mode) */}
      {isSharedLink && activeTab === 'HOME' ? (
        <div className="w-full h-[58px] sm:h-[62px] pointer-events-none select-none" aria-hidden="true" />
      ) : (
        <DesktopHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isEditMode={!isSharedLink && isEditMode}
          onToggleEditMode={handleToggleEditMode}
          isPlayingMusic={isPlayingMusic}
          onToggleMusic={handleToggleMusic}
          onOpenMusicModal={() => setIsMusicModalOpen(true)}
          onOpenEditModal={() => handleOpenEditSection('basic')}
          onReturnToCover={() => setIsCoverView(true)}
          onShare={handleShare}
          data={data}
          isSharedLink={isSharedLink}
        />
      )}

      {/* Share Toast Notification */}
      {copiedNotice && (
        <div className="fixed top-16 right-6 z-50 bg-[#442F2A] text-[#FFF8F5] px-4 py-2 rounded shadow-lg border-2 border-[#E0BAC7] text-xs font-pixel animate-bounce">
          ✓ 已複製專屬戀愛紀錄分享連結！訪客模式已鎖定
        </div>
      )}

      {/* Main 3-Column Layout: Center content sized referencing Loading window proportions with more top spacing */}
      <main className="flex-1 max-w-[1160px] xl:max-w-[1220px] w-full mx-auto px-3 sm:px-5 lg:px-6 pt-7 sm:pt-9 lg:pt-10 pb-10 sm:pb-14 flex flex-col lg:flex-row gap-5 lg:gap-7 xl:gap-8 items-start justify-center">
        {/* Left Column Widgets */}
        <LeftSidebar
          data={data}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isEditMode={!isSharedLink && isEditMode}
          onEditSection={handleOpenEditSection}
        />

        {/* Center Column (Main Views - exact max-w-lg horizontal proportion matching LoadingScreen) */}
        <div className="flex-1 w-full min-w-0 max-w-lg mx-auto">
          {activeTab === 'HOME' && (
            <HomeView
              data={data}
              onNavigateTab={setActiveTab}
              isEditMode={!isSharedLink && isEditMode}
              onEditSection={handleOpenEditSection}
              onUpdateSiteData={(updater) => {
                setData((prev) => {
                  const updated = updater(prev);
                  saveCoupleData(updated);
                  return updated;
                });
              }}
            />
          )}

          {activeTab === 'CHARACTER PROFILE' && (
            <CharacterProfileView
              data={data}
              isEditMode={!isSharedLink && isEditMode}
              onEditSection={handleOpenEditSection}
            />
          )}

          {activeTab === 'STORY' && (
            <StoryView
              data={data}
              isEditMode={!isSharedLink && isEditMode}
              onEditSection={handleOpenEditSection}
            />
          )}

          {activeTab === 'ALBUM' && (
            <AlbumView
              data={data}
              isEditMode={!isSharedLink && isEditMode}
              onEditSection={handleOpenEditSection}
            />
          )}

          {activeTab === 'ALTERNATIVE UNIVERSE' && (
            <AUView
              data={data}
              isEditMode={!isSharedLink && isEditMode}
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
          isEditMode={!isSharedLink && isEditMode}
          onEditSection={handleOpenEditSection}
        />
      </main>

      {/* Floating Music Player Window (as requested) */}
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
        isEditMode={!isSharedLink && isEditMode}
        isSharedLink={isSharedLink}
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

      {/* Bottom Retro TaskBar with HOME button */}
      <TaskBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
