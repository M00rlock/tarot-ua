/**
 * @typedef {'major' | 'minor'} Arcana
 * @typedef {'classic3' | 'pentagram5' | 'love5' | 'career5'} SpreadType
 * @typedef {'psychological' | 'mystic' | 'practical'} InterpretationTone
 * @typedef {'rule-based' | 'llm'} InterpretationProvider
 *
 * @typedef {{ id: string; name: string; arcana: Arcana; keywords: string[]; suit?: string; meaningUpright: string; meaningReversed: string; image: string }} TarotCard
 * @typedef {{ card: TarotCard; position: string; positionDescription: string; reversed: boolean }} DrawnCard
 * @typedef {{ id: SpreadType; title: string; count: number; positions: Array<{ name: string; description: string }> }} SpreadDefinition
 * @typedef {{ title: string; tone: InterpretationTone; summary: string; energy: string; interactions: string[]; advice: string[]; shadow: string; nextStep: string; provider?: InterpretationProvider }} SpreadInterpretation
 * @typedef {{ id: string; email: string; name: string; premiumTier: 'free' | 'premium'; premiumUntil: string | null }} AuthUser
 * @typedef {{ accessToken: string; user: AuthUser }} AuthSession
 * @typedef {{ id: string; title: string; spreadType: SpreadType; cards: DrawnCard[]; interpretation: SpreadInterpretation | null; favorite: boolean; note?: string; createdAt: string }} CloudSpread
 * @typedef {{ title: string; description: string; imageUrl: string }} ShareSocialMeta
 * @typedef {{ id: string; slug: string; title: string; spreadType: SpreadType; cards: DrawnCard[]; interpretation: SpreadInterpretation | null; createdAt: string; url: string; path: string; social: ShareSocialMeta }} SharedSpread
 */

export {};
