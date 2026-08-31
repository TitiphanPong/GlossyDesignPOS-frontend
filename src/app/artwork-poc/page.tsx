import type { Metadata } from 'next';
import { PremiumEditorialArtwork } from '@/components/content-studio/PremiumEditorialArtwork';
import { printFileArtworkSample } from '@/components/content-studio/artwork-model';

export const metadata: Metadata = {
  title: 'Glossy Artwork POC',
  robots: { index: false, follow: false },
};

export default function ArtworkPocPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'start center',
        padding: 'clamp(12px, 3vw, 32px)',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #dfe9f6 0%, #eef4fb 42%, #dfe7f1 100%)',
      }}
    >
      <PremiumEditorialArtwork data={printFileArtworkSample} />
    </main>
  );
}
