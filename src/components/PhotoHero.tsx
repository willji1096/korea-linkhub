import type { Photo } from '@/lib/photos';

// Wide page-top photo with the licence credit it requires.
export function PhotoHero({ photo }: { photo: Photo }) {
  return (
    <figure className="relative mt-4 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-sunken)]">
      <img
        src={photo.src}
        alt={photo.alt}
        className="aspect-[4/3] w-full object-cover min-[480px]:aspect-[16/9] lg:aspect-[3/1]"
        loading="eager"
      />
      <PhotoCredit photo={photo} className="absolute bottom-0 right-0 rounded-tl-[var(--radius-sm)] bg-black/45 px-2 text-white/85" />
    </figure>
  );
}

export function PhotoCredit({ photo, className = '' }: { photo: Photo; className?: string }) {
  return (
    <figcaption className={`text-[10px] leading-none ${className}`}>
      <a href={photo.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center hover:underline">
        Photo: {photo.author} · {photo.license}
      </a>
    </figcaption>
  );
}
