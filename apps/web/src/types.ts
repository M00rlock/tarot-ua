export type Arcana = 'major' | 'minor';
export type SpreadType = 'classic3' | 'pentagram5' | 'love5' | 'career5';

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  keywords: string[];
  suit?: string;
  meaningUpright: string;
  meaningReversed: string;
  image: string;
}

export interface DrawnCard {
  card: TarotCard;
  position: string;
  positionDescription: string;
  reversed: boolean;
}

export interface SpreadDefinition {
  id: SpreadType;
  title: string;
  count: number;
  positions: Array<{ name: string; description: string }>;
}

export type InterpretationTone = 'psychological' | 'mystic' | 'practical';
export type InterpretationProvider = 'rule-based' | 'llm';

export interface SpreadInterpretation {
  title: string;
  tone: InterpretationTone;
  summary: string;
  energy: string;
  interactions: string[];
  advice: string[];
  shadow: string;
  nextStep: string;
  provider?: InterpretationProvider;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  premiumTier: 'free' | 'premium';
  premiumUntil: string | null;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface CloudSpread {
  id: string;
  title: string;
  spreadType: SpreadType;
  cards: DrawnCard[];
  interpretation: SpreadInterpretation | null;
  favorite: boolean;
  note?: string;
  createdAt: string;
}

export interface ShareSocialMeta {
  title: string;
  description: string;
  imageUrl: string;
}

export interface SharedSpread {
  id: string;
  slug: string;
  title: string;
  spreadType: SpreadType;
  cards: DrawnCard[];
  interpretation: SpreadInterpretation | null;
  createdAt: string;
  url: string;
  path: string;
  social: ShareSocialMeta;
}
