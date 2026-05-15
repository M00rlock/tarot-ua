interface MetaInput {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article';
}

function upsertMeta(selector: string, create: () => HTMLMetaElement | HTMLLinkElement, valueSetter: (element: HTMLMetaElement | HTMLLinkElement) => void) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  valueSetter(element);
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function setSeoMeta(input: MetaInput) {
  const title = input.title.trim();
  const description = input.description.trim();
  const canonicalUrl = absoluteUrl(input.canonicalPath || window.location.pathname);
  const image = absoluteUrl(input.image || '/seo/og-default.svg');

  document.title = title;

  upsertMeta('meta[name="description"]', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    return meta;
  }, (meta) => meta.setAttribute('content', description));

  upsertMeta('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    return link;
  }, (link) => link.setAttribute('href', canonicalUrl));

  const og: Record<string, string> = {
    'og:title': title,
    'og:description': description,
    'og:type': input.type || 'website',
    'og:url': canonicalUrl,
    'og:image': image,
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image
  };

  Object.entries(og).forEach(([property, content]) => {
    const selector = property.startsWith('twitter:') ? `meta[name="${property}"]` : `meta[property="${property}"]`;
    upsertMeta(selector, () => {
      const meta = document.createElement('meta');
      if (property.startsWith('twitter:')) meta.setAttribute('name', property);
      else meta.setAttribute('property', property);
      return meta;
    }, (meta) => meta.setAttribute('content', content));
  });
}

export function setJsonLd(id: string, data: unknown) {
  const scriptId = `jsonld-${id}`;
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}
