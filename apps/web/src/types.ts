export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
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
