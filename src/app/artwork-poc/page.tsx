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
        padding: '32px',
        overflow: 'auto',
        background: '#dfe7f1',
      }}
    >
      <PremiumEditorialArtwork data={printFileArtworkSample} />
    </main>
  );
}
