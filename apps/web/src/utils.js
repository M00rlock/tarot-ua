export function cardMeaning(card) {
    return card.reversed ? card.card.meaningReversed : card.card.meaningUpright;
}
