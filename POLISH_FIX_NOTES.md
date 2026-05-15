# Polish fix notes

Changes included in this archive:

- Fixed AI interpretation tone switching blink.
- Old interpretation content now stays visible while the next tone is loading.
- Added subtle loading state on the interpretation panel.
- Added small floating refresh indicator during tone update.
- Added guard to avoid regenerating interpretation when clicking the already active tone.

Touched files:

- apps/web/src/components/InterpretationPanel.vue
- apps/web/src/components/TarotBoard.vue
