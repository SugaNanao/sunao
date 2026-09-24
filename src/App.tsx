import React, { useState, useEffect } from 'react';
import { ActiveTab, CoupleSiteData, ChatMessage, ChatConversationGroup } from './types';
import {
  loadCoupleData,
  saveCoupleData,
  debouncedSaveCoupleData,
  debouncedPublishDataToServer,
  generateShareableUrl,
  isSharedUrl,
  loadCoupleDataFromIndexedDB,
  fetchPublishedDataFromServer,
  publishDataToServer,
} from './utils/storage';
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
import { TaskBar } from './components/TaskBar';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PageDecorationsOverlay } from './components/PageDecorationsOverlay';

// Lazy loaded heavy modals for instant initial page loading
const ChatModal = React.lazy(() => import('./components/ChatModal').then(m => ({ default: m.ChatModal })));
const MusicModal = React.lazy(() => import('./components/MusicModal').then(m => ({ default: m.MusicModal })));
const EditModal = React.lazy(() => import('./components/EditModal').then(m => ({ default: m.EditModal })));
const ShareModal = React.lazy(() => import('./components/ShareModal').then(m => ({ default: m.ShareModal })));
const SyncMobileModal = React.lazy(() => import('./components/SyncMobileModal').then(m => ({ default: m.SyncMobileModal })));

export default function App() {
  const [data, setData] = useState<CoupleSiteData>(loadCoupleData);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoverView, setIsCoverView] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('HOME');
  const [characterProfileTarget, setCharacterProfileTarget] = useState<'BOTH' | 'CHAR_A' | 'CHAR_B'>('BOTH');
  
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
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editInitialTab, setEditInitialTab] = useState('basic');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [publishToast, setPublishToast] = useState<{ show: boolean; message: string; isError?: boolean }>({
    show: false,
    message: '',
  });
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

  // Hydrate full data: compare server published timestamp vs local timestamp
  useEffect(() => {
    if (isSharedLink) return;

    let isMounted = true;

    async function initData() {
      try {
        const [serverResult, dbData] = await Promise.all([
          fetchPublishedDataFromServer(),
          loadCoupleDataFromIndexedDB(),
        ]);

        if (!isMounted) return;

        const serverData = serverResult.published && serverResult.data ? serverResult.data : null;
        const localData = dbData || null;

        const serverTime = serverData?.updatedAt ? new Date(serverData.updatedAt).getTime() : 0;
        const localTime = localData?.updatedAt ? new Date(localData.updatedAt).getTime() : 0;

        // 1. Local device (computer) has newer edits than server:
        if (localData && localTime > serverTime) {
          setData(localData);
          // Automatically update the server so mobile devices immediately receive the latest edits!
          publishDataToServer(localData).then((res) => {
            if (res.success) {
              console.log('[App Sync] Auto-synced local edits to server for mobile/visitors.');
            }
          }).catch(() => {});
          return;
        }

        // 2. Server has newer data (e.g. computer edited, now viewing on mobile):
        if (serverData && serverTime > localTime) {
          setData(serverData);
          saveCoupleData(serverData);
          return;
        }

        // 3. Fallback: use local data if present
        if (localData) {
          setData(localData);
          return;
        }

        // 4. First-time mobile visitor: load server data
        if (serverData) {
          setData(serverData);
          saveCoupleData(serverData);
        }
      } catch (err) {
        console.warn('[App] Hydration error:', err);
      }
    }

    initData();

    return () => {
      isMounted = false;
    };
  }, [isSharedLink]);

  // Mobile / Tab re-focus auto-sync listener:
  // When mobile browser tab is re-activated or pulled down, detect if server has newer data
  useEffect(() => {
    if (isSharedLink) return;

    const checkServerUpdates = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const serverResult = await fetchPublishedDataFromServer();
          if (serverResult.published && serverResult.data && serverResult.data.updatedAt) {
            const serverTime = new Date(serverResult.data.updatedAt).getTime();
            const currentTime = new Date(data.updatedAt || 0).getTime();
            if (serverTime > currentTime + 1000) {
              setData(serverResult.data);
              saveCoupleData(serverResult.data);
              setPublishToast({
                show: true,
                message: '✨ 已自動同步電腦端的最新內容！',
                isError: false,
              });
              setTimeout(() => setPublishToast({ show: false, message: '' }), 4000);
            }
          }
        } catch {}
      }
    };

    document.addEventListener('visibilitychange', checkServerUpdates);
    window.addEventListener('focus', checkServerUpdates);
    return () => {
      document.removeEventListener('visibilitychange', checkServerUpdates);
      window.removeEventListener('focus', checkServerUpdates);
    };
  }, [data.updatedAt, isSharedLink]);

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

  const handlePublishToServer = async (): Promise<boolean> => {
    try {
      const res = await publishDataToServer(data);
      if (res.success) {
        setPublishToast({
          show: true,
          message: '🎉 成功發布至官方短網址！現在任何人打開官方短網址都能看見您的最新內容！',
          isError: false,
        });
        setTimeout(() => setPublishToast({ show: false, message: '' }), 5000);
        return true;
      } else {
        setPublishToast({
          show: true,
          message: `發布未成功：${res.message}`,
          isError: true,
        });
        setTimeout(() => setPublishToast({ show: false, message: '' }), 5000);
        return false;
      }
    } catch {
      setPublishToast({
        show: true,
        message: '連線至伺服器時發生錯誤，請稍後重試。',
        isError: true,
      });
      setTimeout(() => setPublishToast({ show: false, message: '' }), 5000);
      return false;
    }
  };

  const handleUpdateData = (newData: CoupleSiteData) => {
    const updated: CoupleSiteData = {
      ...newData,
      updatedAt: newData.updatedAt || new Date().toISOString(),
    };
    setData(updated);
    debouncedSaveCoupleData(updated, 200);

    // Immediately push to server so mobile phone / external devices receive the update immediately!
    publishDataToServer(updated).then((res) => {
      if (res.success) {
        setPublishToast({
          show: true,
          message: '✅ 已即時同步發布至伺服器！手機端重新整理即可呈現最新編輯。',
          isError: false,
        });
        setTimeout(() => setPublishToast({ show: false, message: '' }), 4500);
      } else {
        setPublishToast({
          show: true,
          message: `⚠️ 本地已儲存，但伺服器同步失敗：${res.message}`,
          isError: true,
        });
        setTimeout(() => setPublishToast({ show: false, message: '' }), 5000);
      }
    }).catch(() => {});
  };

  const handleUpdateChat = (messages: ChatMessage[]) => {
    const next = { ...data, chatHistory: messages };
    setData(next);
    debouncedSaveCoupleData(next, 300);
    debouncedPublishDataToServer(next, 800);
  };

  const handleUpdateChatGroups = (groups: ChatConversationGroup[]) => {
    const next = { ...data, chatGroups: groups };
    setData(next);
    debouncedSaveCoupleData(next, 300);
    debouncedPublishDataToServer(next, 800);
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
          onPublish={handlePublishToServer}
          onOpenMobileSync={() => setIsSyncModalOpen(true)}
        />
      )}

      {/* Publish Toast Notification */}
      {publishToast.show && (
        <div
          className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded-md font-pixel text-xs border shadow-xl animate-fade-in flex items-center gap-2 ${
            publishToast.isError
              ? 'bg-amber-900 text-amber-100 border-amber-500'
              : 'bg-[#235347] text-emerald-100 border-emerald-400'
          }`}
        >
          <span>{publishToast.isError ? '⚠️' : '🎉'}</span>
          <span>{publishToast.message}</span>
        </div>
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
          onUpdateData={handleUpdateData}
        />

        {/* Center Main Stage Area (Router Views) */}
        <div className="flex-1 w-full min-w-0 relative" id="main-content-view">
          {/* Page Decorations Overlay (貼圖覆蓋層，支援多張貼圖自由指派分頁與拖曳調整) */}
          <PageDecorationsOverlay
            data={data}
            currentPage={
              activeTab === 'HOME'
                ? 'HOME'
                : activeTab === 'CHARACTER' || activeTab === 'CHARACTER PROFILE'
                ? 'CHARACTER'
                : activeTab === 'STORY'
                ? 'STORY'
                : activeTab === 'ALBUM'
                ? 'ALBUM'
                : 'AU'
            }
            isEditMode={effectiveEditMode}
            onUpdateData={handleUpdateData}
          />

          {activeTab === 'HOME' && (
            <HomeView
              data={data}
              onNavigateTab={(tab) => {
                if (tab === 'CHARACTER') {
                  setCharacterProfileTarget('BOTH');
                }
                setActiveTab(tab);
              }}
              isEditMode={effectiveEditMode}
              onEditSection={handleOpenEditSection}
              onOpenMusicModal={() => setIsMusicModalOpen(true)}
              onOpenChat={() => setIsChatOpen(true)}
              onNavigateToCharacter={(char) => {
                setCharacterProfileTarget(char);
                setActiveTab('CHARACTER');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {(activeTab === 'CHARACTER' || activeTab === 'CHARACTER PROFILE') && (
            <CharacterProfileView
              data={data}
              isEditMode={effectiveEditMode}
              onEditSection={handleOpenEditSection}
              onUpdateData={handleUpdateData}
              targetCharacter={characterProfileTarget}
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

      {/* Lazy Modals loaded on-demand */}
      <React.Suspense fallback={null}>
        {isChatOpen && (
          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            data={data}
            isEditMode={effectiveEditMode}
            isSharedLink={isVisitor}
            onUpdateChatHistory={handleUpdateChat}
            onUpdateChatGroups={handleUpdateChatGroups}
          />
        )}

        {isMusicModalOpen && (
          <MusicModal
            isOpen={isMusicModalOpen}
            onClose={() => setIsMusicModalOpen(false)}
            isPlaying={isPlayingMusic}
            onTogglePlay={handleToggleMusic}
          />
        )}

        {isEditModalOpen && (
          <EditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            data={data}
            onSaveData={handleUpdateData}
            initialTab={editInitialTab}
          />
        )}

        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            data={data}
            onImportData={handleUpdateData}
            onUpdateData={handleUpdateData}
            onPublish={handlePublishToServer}
          />
        )}

        {isSyncModalOpen && (
          <SyncMobileModal
            isOpen={isSyncModalOpen}
            onClose={() => setIsSyncModalOpen(false)}
            data={data}
            onUpdateData={handleUpdateData}
            onDataPublished={(newTime) => {
              setData((prev) => ({ ...prev, updatedAt: newTime }));
            }}
          />
        )}
      </React.Suspense>

      {/* Admin Authentication & Console Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        data={data}
        onImportData={handleUpdateData}
        onPublish={handlePublishToServer}
      />

      {/* Bottom Retro TaskBar with HOME button, Mobile Sync & Admin trigger */}
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
        onOpenMobileSync={() => setIsSyncModalOpen(true)}
        onShare={handleShare}
      />
    </div>
  );
}
