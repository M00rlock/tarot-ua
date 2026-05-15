export function cardMeaning(card) {
    return card.reversed ? card.card.meaningReversed : card.card.meaningUpright;
}
export function pluralizeCards(count) {
    if (count === 1)
        return 'карта';
    if (count >= 2 && count <= 4)
        return 'карти';
    return 'карт';
}
export function formatCardsCount(count) {
    return `${count} ${pluralizeCards(count)}`;
}
