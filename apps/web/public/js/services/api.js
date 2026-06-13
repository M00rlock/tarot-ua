import { getCards, getSpreadDefinitions, drawSpread, getCardOfDay, generateInterpretation } from './tarot-engine.js';

export function zavantazhytyKarta(kilkist = 78) {
  return Promise.resolve(getCards(kilkist));
}

export function zavantazhytyRozkładVyznachennia() {
  return Promise.resolve(getSpreadDefinitions());
}

export function namaliuvatyRozkład(kilkist = 3, type) {
  return Promise.resolve(drawSpread(kilkist, type));
}

export function zavantazhytyKartaDen(date) {
  return Promise.resolve(getCardOfDay(date ? new Date(date) : new Date()));
}

export function zavantazhytyRozkładInterpretatsiia(spread, type, tone = 'psychological') {
  return Promise.resolve(generateInterpretation(spread, type, tone));
}

// --- Share (прихована фіча, буде реалізована пізніше) ---

export function stvorytyDostupnyiRozkład(_input) {
  return Promise.reject(new Error('Sharing тимчасово недоступний'));
}

export function zavantazhytySpilnyiRozkład(_slug) {
  return Promise.reject(new Error('Sharing тимчасово недоступний'));
}
