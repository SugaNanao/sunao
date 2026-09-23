export interface ColorSwatch {
  label: string; // e.g. "HAIR", "EYE"
  color: string; // display name or hex
  colorCode?: string; // hex code
}

export interface CharacterStatus {
  label: string; // e.g. "親密", "激情", "承諾"
  value: number; // 0 - 100
}

export interface CharacterSection {
  number: string; // e.g. "01", "02"
  title: string;
  content: string;
}

export interface PersonalityParagraph {
  id: string;
  title: string;
  content: string;
}

export interface CharacterTriviaItem {
  id: string;
  fact: string;
  comment?: string;
  commenterName?: string;
}

export interface ProfileBulletItem {
  id: string;
  title: string; // 粗體小標
  content: string; // 內文
}

export interface Character {
  name: string;
  romajiName?: string;
  role: string;
  avatar: string;
  gender?: string; // 性別 (Gender)
  age?: string; // 年齡 (Age)
  occupation?: string; // 身份/職業 (Occupation)
  animal?: string; // 代表動物 (Animal)
  bodyType?: string; // 體型/身高 (Body Type)
  tagsBadge?: string; // e.g. "INFJ, 無辣不歡, òωó."
  swatches?: ColorSwatch[];
  statusList?: CharacterStatus[];
  sections?: CharacterSection[];
  birthday: string;
  constellation: string;
  bloodType: string;
  mbti: string;
  height: string;
  likes: string[];
  dislikes: string[];
  personality: string;
  quote: string;
  fortuneStars: number;
  fortuneNote: string;
  color: string;
  appearance?: string; // 外貌描述
  appearanceItems?: ProfileBulletItem[]; // 外貌描述條列 (✦+粗體小標+內文)
  personalityAnalysis?: string; // 性格剖析 (legacy)
  personalityParagraphs?: PersonalityParagraph[]; // 性格剖析多段落
  relationships?: string; // 人際關係
  relationshipItems?: ProfileBulletItem[]; // 人際關係條列 (✦+粗體小標+內文)
  trivia?: string; // 冷知識 (legacy)
  triviaItems?: CharacterTriviaItem[]; // 冷知識列表 (含吐槽小視窗)
  basicInfoList?: string[]; // 基本資料條列 (高校３年現在)
  highSchoolStatus?: string; // 高校３年現在
  cornerImage?: string; // 人物姓名區右下角透明底圖片 (Corner Transparent Image)
  cornerImagePosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom'; // 圖片擺放位置
  cornerImageScale?: number; // 圖片縮放大小 (70 ~ 150%)
  cornerImageOffsetX?: number; // 水平微調偏移 (px)
  cornerImageOffsetY?: number; // 垂直微調偏移 (px)
}

export interface CoupleProfileItem {
  id: string;
  category: string; // e.g. "代表色", "代表物", "動物意象", "專屬稱呼", "心動暗號"
  charAValue: string;
  charANote?: string;
  charBValue: string;
  charBNote?: string;
  sugaNanaValue?: string;
  sugaNanaNote?: string;
  note?: string; // legacy fallback
}

export interface CoupleProfile {
  title?: string;
  motto?: string;
  verse?: string;
  items: CoupleProfileItem[];
}

export interface ChatConversationGroup {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface Dialogue {
  id: string;
  charASpeech: string;
  charBSpeech: string;
  mood?: string;
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  desc: string;
  icon?: string;
  tag?: string;
}

export interface AlbumPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
  location?: string;
  tag: string;
  showOnHome?: boolean; // 是否展示於 HOME 首頁 (可自行勾選/選擇)
  homeOrder?: number; // 首頁展示排序
  previewPositionX?: number; // 水平對齊/對焦點 0% ~ 100% (預設 50%)
  previewPositionY?: number; // 垂直對齊/對焦點 0% ~ 100% (預設 50%)
  previewScale?: number; // 縮放比例 100% ~ 200% (預設 100%)
}

export interface StoryChapter {
  id: string;
  chapterNumber: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  coverImage?: string;
  mood?: string;
}

export interface AUStory {
  id: string;
  title: string;
  date?: string;
  content: string;
}

export interface AlternativeUniverse {
  id: string;
  title: string;
  genre: string;
  tag: string;
  premise: string;
  charARole: string;
  charBRole: string;
  storySnippet?: string;
  coverImage?: string;
  stories?: AUStory[];
}

export interface ChatMessage {
  id: string;
  sender: 'a' | 'b';
  text: string;
  time: string;
  sticker?: string;
}

export type DecorationPageTarget = 'ALL' | 'HOME' | 'CHARACTER' | 'ALBUM' | 'STORY' | 'AU';

export interface PageDecorationItem {
  id: string;
  name: string; // 貼圖名稱或備註
  imageUrl: string; // 圖片連結或本機上傳
  targetPage: DecorationPageTarget; // 顯示分頁
  targetCharacter?: 'BOTH' | 'CHAR_A' | 'CHAR_B'; // 若在角色頁面，可指定角色姓名區
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'free-drag';
  scale?: number; // 縮放大小 50 ~ 200% (預設 100)
  rotation?: number; // 旋轉角度 -180 ~ 180 (預設 0)
  offsetX?: number; // 水平偏移 px
  offsetY?: number; // 垂直偏移 px
  opacity?: number; // 不透明度 0.1 ~ 1.0 (預設 1.0)
  visible?: boolean; // 是否啟用顯示 (預設 true)
  zIndex?: number; // 圖層深度
}

export interface SpecialDate {
  id: string;
  date: string; // MM-DD or YYYY-MM-DD (e.g. "09-28" or "2026-09-28")
  title: string; // e.g. "9/28 夏日花火回憶日"
  category?: 'anniversary' | 'holiday'; // 'anniversary' = 紀念日 (粉色愛心), 'holiday' = 節日 (粉色星星線條框)
  note?: string; // description / story
  tag?: string;
  color?: string;
}

export interface PopupModalData {
  title: string;
  content: string;
}

export interface PageHeaderTitle {
  title: string;
  subtitle: string;
}

export interface PageTitlesConfig {
  character?: PageHeaderTitle;
  story?: PageHeaderTitle;
  album?: PageHeaderTitle;
  au?: PageHeaderTitle;
}

export interface CoupleSiteData {
  siteTitle: string;
  siteSubtitle: string;
  introQuote: string;
  introDescription: string;
  introNotice?: PopupModalData;
  introMemo?: PopupModalData;
  pageTitles?: PageTitlesConfig;
  anniversaryDate: string; // YYYY-MM-DD
  anniversaryNote?: string; // e.g. "相識於2024.02.22"
  coverImage: string;
  coverTitle: string;
  coverPromptText: string;
  coverTopStatus?: string;
  coverNoteTitle?: string;
  coverWelcomeText?: string;
  coverQuoteText?: string;
  coverBottomText?: string;
  sidebarAvatar?: string; // 側邊欄個人自訂頭貼 (Sidebar Avatar)
  mainIllustration: string;
  weatherCity: string;
  weatherTemp: string;
  weatherCondition: string;
  weatherSweetIndex: string;
  characterA: Character;
  characterB: Character;
  dialogues: Dialogue[];
  milestones: Milestone[];
  album: AlbumPhoto[];
  albumCustomTags?: string[];
  homeAlbumPhotoIds?: string[]; // 自選首頁展示相片 ID 清單
  stories: StoryChapter[];
  alternativeUniverses: AlternativeUniverse[];
  chatHistory: ChatMessage[];
  chatGroups?: ChatConversationGroup[];
  specialDates?: SpecialDate[];
  coupleProfile?: CoupleProfile;
  decorations?: PageDecorationItem[]; // 全站各分頁透明底裝飾貼圖清單
  bgMusicPlaying: boolean;
  updatedAt?: string;
}

export const ALBUM_ALL_TAG = '#記憶のかけら';
export const ALBUM_ITEM_TAGS = ['#いつもの景色', '#季節のしるし', '#ともに過ごした日々'] as const;
export const ALBUM_PRESET_TAGS = [ALBUM_ALL_TAG, ...ALBUM_ITEM_TAGS] as const;

export type ActiveTab = 'HOME' | 'CHARACTER' | 'CHARACTER PROFILE' | 'STORY' | 'ALBUM' | 'AU' | 'ALTERNATIVE UNIVERSE';
