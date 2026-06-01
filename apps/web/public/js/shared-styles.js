let sharedSheet = null;
let sheetPromise = null;

function getSharedSheet() {
  if (sharedSheet) return sharedSheet;
  if (!sheetPromise) {
    sheetPromise = fetch('/css/styles.css')
      .then((r) => r.text())
      .then((css) => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        sharedSheet = sheet;
        return sheet;
      })
      .catch(() => null);
  }
  return sheetPromise;
}

export async function adoptStyles(element) {
  const sheet = await getSharedSheet();
  if (sheet) {
    element.shadowRoot.adoptedStyleSheets = [sheet];
  }
}
