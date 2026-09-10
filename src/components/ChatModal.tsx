import React, { useState, useRef, useEffect } from 'react';
import { CoupleSiteData, ChatMessage, ChatConversationGroup } from '../types';
import { MessageCircle, Send, Sparkles, X, Plus, Trash2, Dices, RotateCcw, Eye, Edit2, Check } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CoupleSiteData;
  isEditMode: boolean;
  isSharedLink?: boolean;
  onUpdateChatHistory?: (messages: ChatMessage[]) => void;
  onUpdateChatGroups?: (groups: ChatConversationGroup[]) => void;
}

const DEFAULT_FALLBACK_GROUPS: ChatConversationGroup[] = [
  {
    id: 'grp-1',
    title: '放學後的自動販賣機前',
    messages: [
      {
        id: 'g1-1',
        sender: 'b',
        text: '孝支！草莓大福最後一個被我搶到了～🍓',
        time: '18:32',
      },
      {
        id: 'g1-2',
        sender: 'a',
        text: '好狡猾！明明是我先看到的吧？我剛練習完超餓耶。',
        time: '18:33',
      },
      {
        id: 'g1-3',
        sender: 'b',
        text: '哼哼，兵貴神速！不過看在你今天托球很帥的份上……分你咬一大口好了 (๑•̀ㅂ•́)و✧',
        time: '18:34',
      },
      {
        id: 'g1-4',
        sender: 'a',
        text: '這還差不多。那今天的熱可可我請客，販賣機按好了，快過來拿。',
        time: '18:35',
      },
      {
        id: 'g1-5',
        sender: 'b',
        text: '好耶！孝支最好了～那等一下要牽著手走回家喔 ♡',
        time: '18:36',
      },
      {
        id: 'g1-6',
        sender: 'a',
        text: '……真是的，拿妳沒辦法。手伸過來，快涼掉了。',
        time: '18:37',
      },
    ],
  },
  {
    id: 'grp-2',
    title: '排球館外的小碎念',
    messages: [
      {
        id: 'g2-1',
        sender: 'a',
        text: '今天練習賽的時候，妳又拍了幾百張照片吧？相機電池撐得住嗎？',
        time: '19:10',
      },
      {
        id: 'g2-2',
        sender: 'b',
        text: '那是當然！二傳手菅原前輩的托球姿勢，我可是全世界第一位專屬攝影師呢 📸',
        time: '19:11',
      },
      {
        id: 'g2-3',
        sender: 'a',
        text: '噗，專屬攝影師小姐，那請問我的獨家抓拍可以申請看一眼嗎？',
        time: '19:12',
      },
      {
        id: 'g2-4',
        sender: 'b',
        text: '不行～那是我的私藏寶物！只有等回家我挑出最帥的一張才傳給你。',
        time: '19:13',
      },
      {
        id: 'g2-5',
        sender: 'a',
        text: '好啦好啦。我在社辦門口了，妳圍巾圍好了沒？外面風大。',
        time: '19:14',
      },
      {
        id: 'g2-6',
        sender: 'b',
        text: '圍好啦！而且我還帶了兩杯熱柚子茶，快點出來一起喝～(੭ˊᵕˋ)੭*',
        time: '19:15',
      },
    ],
  },
];

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  data,
  isEditMode,
  isSharedLink = false,
  onUpdateChatGroups,
}) => {
  // Determine available groups
  const groups = (data.chatGroups && data.chatGroups.length > 0)
    ? data.chatGroups
    : DEFAULT_FALLBACK_GROUPS;

  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
  const [revealedCount, setRevealedCount] = useState<number>(1);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editTitleText, setEditTitleText] = useState<string>('');
  
  // Message input state for non-shared edit mode
  const [inputText, setInputText] = useState('');
  const [newMsgSender, setNewMsgSender] = useState<'a' | 'b'>('a');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When modal opens, pick a random conversation group and initialize revealedCount to 1
  useEffect(() => {
    if (isOpen && groups.length > 0) {
      const randomIndex = Math.floor(Math.random() * groups.length);
      setActiveGroupIndex(randomIndex);
      setRevealedCount(1);
      setIsEditingTitle(false);
    }
  }, [isOpen]);

  // Ensure active index is within bounds
  const currentGroup: ChatConversationGroup = groups[activeGroupIndex] || groups[0] || {
    id: 'grp-default',
    title: '甜蜜日常對話',
    messages: [],
  };

  const totalMessages = currentGroup.messages.length;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [revealedCount, activeGroupIndex, isOpen]);

  if (!isOpen) return null;

  // Handle clicking screen to reveal next message
  const handleAdvanceDialogue = () => {
    if (revealedCount < totalMessages) {
      setRevealedCount((prev) => prev + 1);
    } else {
      // If already at end, clicking resets back to 1 for smooth replay
      setRevealedCount(1);
    }
  };

  // Randomize to a different group
  const handleRandomGroup = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (groups.length <= 1) {
      setRevealedCount(1);
      return;
    }
    let nextIndex = activeGroupIndex;
    while (nextIndex === activeGroupIndex) {
      nextIndex = Math.floor(Math.random() * groups.length);
    }
    setActiveGroupIndex(nextIndex);
    setRevealedCount(1);
  };

  // Switch to previous or next group explicitly
  const handleSelectGroup = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveGroupIndex(idx);
    setRevealedCount(1);
  };

  // Add new message to current group (Admin/Edit mode only)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: newMsgSender,
      text: inputText.trim(),
      time: timeStr,
    };

    const updatedGroups = groups.map((grp, idx) => {
      if (idx === activeGroupIndex) {
        return {
          ...grp,
          messages: [...grp.messages, newMsg],
        };
      }
      return grp;
    });

    if (onUpdateChatGroups) {
      onUpdateChatGroups(updatedGroups);
    }
    setInputText('');
    setRevealedCount((prev) => prev + 1);
    // Alternate speaker for fast authoring
    setNewMsgSender((prev) => (prev === 'a' ? 'b' : 'a'));
  };

  // Delete a message in current group
  const handleDeleteMessage = (msgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedGroups = groups.map((grp, idx) => {
      if (idx === activeGroupIndex) {
        return {
          ...grp,
          messages: grp.messages.filter((m) => m.id !== msgId),
        };
      }
      return grp;
    });
    if (onUpdateChatGroups) {
      onUpdateChatGroups(updatedGroups);
    }
    if (revealedCount > 1) {
      setRevealedCount((prev) => Math.max(1, prev - 1));
    }
  };

  // Add a new conversation group
  const handleAddNewGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newGrp: ChatConversationGroup = {
      id: 'grp-' + Date.now(),
      title: `新對話組別 #${groups.length + 1}`,
      messages: [
        {
          id: 'msg-start-' + Date.now(),
          sender: 'a',
          text: '今天過得還好嗎？',
          time: '18:00',
        },
        {
          id: 'msg-reply-' + Date.now(),
          sender: 'b',
          text: '看到你就不累了！(˶ᵔ ᵕ ᵔ˶)',
          time: '18:01',
        },
      ],
    };
    const nextGroups = [...groups, newGrp];
    if (onUpdateChatGroups) {
      onUpdateChatGroups(nextGroups);
    }
    setActiveGroupIndex(nextGroups.length - 1);
    setRevealedCount(1);
  };

  // Save edited title
  const handleSaveTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitleText.trim()) {
      setIsEditingTitle(false);
      return;
    }
    const updatedGroups = groups.map((grp, idx) => {
      if (idx === activeGroupIndex) {
        return { ...grp, title: editTitleText.trim() };
      }
      return grp;
    });
    if (onUpdateChatGroups) {
      onUpdateChatGroups(updatedGroups);
    }
    setIsEditingTitle(false);
  };

  // Delete current group
  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (groups.length <= 1) return;
    const nextGroups = groups.filter((_, idx) => idx !== activeGroupIndex);
    if (onUpdateChatGroups) {
      onUpdateChatGroups(nextGroups);
    }
    setActiveGroupIndex(0);
    setRevealedCount(1);
  };

  // Visible messages according to revealedCount
  const visibleMessages = currentGroup.messages.slice(0, revealedCount);
  const isFinished = revealedCount >= totalMessages;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="pixel-window w-full max-w-md h-[580px] sm:h-[620px] flex flex-col rounded-lg overflow-hidden shadow-2xl bg-[#FFF8F5]"
        id="chat-messenger-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar: EXACT TITLE "MESSAGE" */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-3.5 py-2.5 flex items-center justify-between font-pixel text-xs tracking-wider border-b-2 border-[#33221e]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#E0BAC7]" />
            <span className="font-bold text-sm text-[#FFF8F5]">MESSAGE</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Random Switch Group Button */}
            <button
              onClick={handleRandomGroup}
              className="flex items-center gap-1 bg-[#E0BAC7] hover:bg-[#d49bb0] text-[#442F2A] px-2.5 py-1 rounded text-[11px] font-pixel font-bold border border-[#442F2A] cursor-pointer shadow-xs transition active:scale-95"
              title="隨機切換對話組別"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>隨機切換 ({activeGroupIndex + 1}/{groups.length})</span>
            </button>

            <button
              onClick={onClose}
              className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Group Info & Dialogue Progress Bar */}
        <div className="bg-[#F8EDF1] border-b-2 border-[#442F2A] px-3 py-1.5 flex items-center justify-between text-xs font-pixel text-[#442F2A]">
          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            
            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={editTitleText}
                  onChange={(e) => setEditTitleText(e.target.value)}
                  className="bg-white border border-[#442F2A] rounded px-1.5 py-0.5 text-xs font-pixel flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 bg-[#E0BAC7] text-[#442F2A] rounded cursor-pointer"
                  title="儲存標題"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold truncate text-[#442F2A] text-xs">
                  ✦ {currentGroup.title}
                </span>
                {!isSharedLink && isEditMode && (
                  <button
                    onClick={() => {
                      setEditTitleText(currentGroup.title);
                      setIsEditingTitle(true);
                    }}
                    className="text-[#442F2A]/60 hover:text-[#442F2A] cursor-pointer p-0.5"
                    title="編輯組別標題"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Group management controls for non-visitor edit mode */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isSharedLink && isEditMode && (
              <>
                <button
                  onClick={handleAddNewGroup}
                  className="flex items-center gap-0.5 bg-[#FFF8F5] hover:bg-[#E0BAC7] text-[#442F2A] px-1.5 py-0.5 rounded border border-[#442F2A] text-[10px] font-pixel cursor-pointer"
                  title="新增對話組別"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增組</span>
                </button>
                {groups.length > 1 && (
                  <button
                    onClick={handleDeleteGroup}
                    className="p-1 text-[#C89398] hover:text-red-700 cursor-pointer"
                    title="刪除當前組別"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </>
            )}

            {/* Quick replay / reveal all button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isFinished) {
                  setRevealedCount(1);
                } else {
                  setRevealedCount(totalMessages);
                }
              }}
              className="flex items-center gap-1 bg-[#FFF8F5] border border-[#442F2A] px-1.5 py-0.5 rounded text-[10px] hover:bg-[#E0BAC7] transition cursor-pointer font-bold"
              title={isFinished ? '重新從第一則逐一播放' : '直接展開本組全部訊息'}
            >
              {isFinished ? (
                <>
                  <RotateCcw className="w-3 h-3 text-[#442F2A]" />
                  <span>重播</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 text-[#442F2A]" />
                  <span>展開全部</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chat History Messages Screen (Clicking advances dialogue逐一顯示) */}
        <div
          onClick={handleAdvanceDialogue}
          className="flex-1 overflow-y-auto p-3.5 space-y-3 soft-dot-bg cursor-pointer relative"
          id="dialogue-stage-area"
        >
          {visibleMessages.map((msg, idx) => {
            const isCharA = msg.sender === 'a';
            const char = isCharA ? data.characterA : data.characterB;
            const isLatest = idx === visibleMessages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 group animate-fade-in ${
                  isCharA ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full border border-[#442F2A] overflow-hidden bg-white shrink-0 shadow-sm">
                  <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[78%] flex flex-col ${isCharA ? 'items-start' : 'items-end'}`}>
                  <span className="text-[10px] font-pixel text-[#442F2A]/60 px-1 mb-0.5">
                    {char.name}
                  </span>
                  <div
                    className={`p-2.5 rounded-2xl text-xs font-pixel leading-relaxed border-2 border-[#442F2A] shadow-xs relative break-words ${
                      isCharA
                        ? 'bg-white text-[#442F2A] rounded-bl-xs'
                        : 'bg-[#E0BAC7] text-[#442F2A] rounded-br-xs'
                    } ${isLatest && !isFinished ? 'ring-2 ring-[#C89398]/50' : ''}`}
                  >
                    <span>{msg.text}</span>

                    {/* Delete button only in non-visitor edit mode */}
                    {!isSharedLink && isEditMode && (
                      <button
                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                        className="ml-2 text-[#C89398] opacity-0 group-hover:opacity-100 hover:text-red-700 transition"
                        title="刪除訊息"
                      >
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] font-pixel text-[#442F2A]/50 px-1 mt-0.5">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />

          {/* Interactive Tap Prompt Overlay at the bottom */}
          <div className="pt-2 pb-1 text-center pointer-events-none sticky bottom-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8F5]/95 border border-[#442F2A]/40 text-[11px] font-pixel text-[#442F2A] shadow-md">
              {isFinished ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-[#C89398]" />
                  <span className="font-bold text-[#C89398]">
                    ✦ 本組對話結束 (點擊重新播放，或點擊上方「隨機切換」)
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#C89398] animate-spin" />
                  <span className="font-bold">
                    點擊螢幕顯示下一則訊息 ({revealedCount}/{totalMessages})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Area: Visitor Mode vs Edit Mode */}
        {isSharedLink || !isEditMode ? (
          /* Visitor Mode: No typing, no identity switcher, only friendly prompt */
          <div className="bg-[#FFF8F5] border-t-2 border-[#442F2A] px-3.5 py-2.5 text-center text-xs font-pixel text-[#442F2A] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#442F2A]/80 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#C89398] animate-ping" />
              <span>點擊對話視窗推進對話</span>
            </div>
            <span className="text-[11px] font-bold text-[#9D5A64]">
              {data.characterA.name} ♡ {data.characterB.name}
            </span>
          </div>
        ) : (
          /* Non-Visitor Edit Mode: Input field to add messages to current group (Identity toggle button removed as requested) */
          <form
            onSubmit={handleSendMessage}
            className="bg-[#FFF8F5] border-t-2 border-[#442F2A] p-2.5 flex items-center gap-2"
          >
            {/* Direct speaker selector (菅原孝支 / 宮原七緒) */}
            <select
              value={newMsgSender}
              onChange={(e) => setNewMsgSender(e.target.value as 'a' | 'b')}
              className="bg-white border-2 border-[#442F2A] rounded px-2 py-1 text-xs font-pixel text-[#442F2A] outline-none font-bold"
            >
              <option value="a">{data.characterA.name}</option>
              <option value="b">{data.characterB.name}</option>
            </select>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`以 ${newMsgSender === 'a' ? data.characterA.name : data.characterB.name} 的口吻追加對話...`}
              className="flex-1 bg-white border-2 border-[#442F2A] rounded px-2.5 py-1.5 text-xs font-pixel text-[#442F2A] outline-none focus:ring-1 focus:ring-[#C89398]"
            />

            <button
              type="submit"
              className="pixel-btn bg-[#E0BAC7] hover:bg-[#d49bb0] px-3 py-1.5 text-xs font-pixel font-bold flex items-center gap-1 rounded cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
