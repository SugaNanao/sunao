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

export interface CoupleSiteData {
  siteTitle: string;
  siteSubtitle: string;
  introQuote: string;
  introDescription: string;
  introNotice?: PopupModalData;
  introMemo?: PopupModalData;
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
  stories: StoryChapter[];
  alternativeUniverses: AlternativeUniverse[];
  chatHistory: ChatMessage[];
  chatGroups?: ChatConversationGroup[];
  specialDates?: SpecialDate[];
  coupleProfile?: CoupleProfile;
  bgMusicPlaying: boolean;
}

export const ALBUM_ALL_TAG = '#記憶のかけら';
export const ALBUM_ITEM_TAGS = ['#いつもの景色', '#季節のしるし', '#ともに過ごした日々'] as const;
export const ALBUM_PRESET_TAGS = [ALBUM_ALL_TAG, ...ALBUM_ITEM_TAGS] as const;

export type ActiveTab = 'HOME' | 'CHARACTER' | 'CHARACTER PROFILE' | 'STORY' | 'ALBUM' | 'AU' | 'ALTERNATIVE UNIVERSE';
