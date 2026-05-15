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

export interface SpreadInterpretation {
  title: string;
  tone: InterpretationTone;
  summary: string;
  energy: string;
  interactions: string[];
  advice: string[];
  shadow: string;
  nextStep: string;
}
