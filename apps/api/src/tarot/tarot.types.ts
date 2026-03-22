export type Arcana = 'major' | 'minor';

export interface TarotCard {
  id: string;
  name: string;
  arcana: Arcana;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
  image: string;
}

export interface DrawnCard {
  card: TarotCard;
  position: string;
  reversed: boolean;
}
