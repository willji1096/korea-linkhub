import learnData from '@/data/learn.json';

export type Phrase = { en: string; ko: string; roman: string };

export type LearnCard = {
  id: string;
  kind: 'phrases' | 'etiquette' | 'place-story';
  title_en: string;
  title_ko: string;
  summary_en: string;
  read_min: number;
  photo?: string;
  sections: {
    title_en: string;
    lead?: boolean;
    points_en?: string[];
    do_en?: string[];
    dont_en?: string[];
    timeline?: { year: string; text: string }[];
    phrases?: Phrase[];
  }[];
  related_help?: string[];
  related_places: string[];
  sources: { field: string; url: string }[];
  last_verified: string;
  confidence: 'verified' | 'partial';
};

export const LEARN = learnData.items as LearnCard[];

export function getLearn(id: string): LearnCard | undefined {
  return LEARN.find((c) => c.id === id);
}

export const KIND_LABEL: Record<LearnCard['kind'], string> = {
  phrases: 'Korean',
  etiquette: 'Etiquette',
  'place-story': 'Know before you go',
};
