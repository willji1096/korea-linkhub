import type { LearnCard } from '@/lib/learn';
import { getPhoto, thumbSrc } from '@/lib/photos';

// Card cover for a Learn read: its photo, or the Korean title set large when there is none.
export function LearnCover({ card, className = '' }: { card: LearnCard; className?: string }) {
  const photo = card.photo ? getPhoto(card.photo) : undefined;
  if (photo) {
    return (
      <img src={thumbSrc(photo)} alt="" title={`Photo: ${photo.author} · ${photo.license}`} className={`w-full object-cover ${className}`} loading="lazy" />
    );
  }
  return (
    <span className={`flex w-full items-end bg-[var(--accent-soft)] p-4 ${className}`} aria-hidden>
      <span lang="ko" className="text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--accent)]">
        {card.title_ko}
      </span>
    </span>
  );
}
