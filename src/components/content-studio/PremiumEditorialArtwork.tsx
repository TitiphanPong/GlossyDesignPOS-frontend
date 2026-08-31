import Image from 'next/image';
import type { ArtworkInfoCard, PremiumEditorialArtworkData } from './artwork-model';
import { truncateThaiText } from './artwork-model';
import styles from './PremiumEditorialArtwork.module.css';

function CardVisual({ card, negative }: { card: ArtworkInfoCard; negative: boolean }) {
  return (
    <div className={styles.iconTile} aria-hidden="true">
      {card.visual === 'files' && <div className={styles.miniFiles}><span className={styles.miniFile}>PNG</span><span className={styles.miniFile}>PDF</span><span className={styles.miniFile}>Ai</span></div>}
      {card.visual === 'image' && <div className={styles.picture} />}
      {card.visual === 'original' && <div className={styles.original}>ORIGINAL</div>}
      {card.visual === 'screenshot' && <div className={styles.phone}><div className={styles.phoneScreen} /></div>}
      {card.visual === 'pixelated' && <div className={styles.pixel} />}
      {card.visual === 'small-file' && <div className={styles.smallFile} />}
      {negative && <span className={styles.warning}>!</span>}
    </div>
  );
}

export function PremiumEditorialArtwork({ data }: { data: PremiumEditorialArtworkData }) {
  return (
    <article
      className={styles.stage}
      data-artwork-canvas="true"
      data-artwork-ready="true"
      aria-label="Glossy premium editorial artwork"
    >
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>{truncateThaiText(data.eyebrow, 32)}</div>
          <h1 className={styles.headline}>
            {truncateThaiText(data.headline, 22)}
            <span className={styles.headlineAccent}>{truncateThaiText(data.headlineAccent, 22)}</span>
          </h1>
          <p className={styles.subheadline}>{truncateThaiText(data.subheadline, 82)}</p>
        </div>
        <div className={styles.heroVisual} role="img" aria-label={data.visual.alt} data-visual-provider={data.visual.provider}>
          <div className={styles.folder} />
          <span className={styles.fileChip}>PNG</span>
          <span className={styles.fileChip}>PDF</span>
          <span className={styles.fileChip}>Ai</span>
          <span className={styles.visualCheck}>✓</span>
        </div>
      </header>

      <section className={styles.columns}>
        {data.columns.map(column => {
          const negative = column.tone === 'negative';
          return (
            <div className={styles.column} key={column.label}>
              <div className={`${styles.columnHeader} ${negative ? styles.negative : styles.positive}`}>
                {column.label}<span className={styles.badge}>{negative ? '×' : '✓'}</span>
              </div>
              {column.cards.slice(0, 3).map((card, index) => (
                <div className={styles.card} key={`${column.label}-${index}`}>
                  <CardVisual card={card} negative={negative} />
                  <div>
                    <div className={styles.cardTitle}>{truncateThaiText(card.title, 23)}</div>
                    {card.emphasis && <span className={`${styles.cardEmphasis} ${negative ? styles.negativeText : ''}`}>{truncateThaiText(card.emphasis, 24)}</span>}
                    <div className={styles.cardBody}>{truncateThaiText(card.body, 54)}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      <div className={styles.tip}>
        <span className={styles.bulb}>✦</span>
        <div className={styles.tipText}>{truncateThaiText(data.tip, 30)}<br /><span className={styles.tipAccent}>{truncateThaiText(data.tipAccent, 74)}</span></div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.brand}>
          <Image src="/logo/logo_website.png" alt="" width={62} height={62} priority />
          <div><div className={styles.brandWord}>GLOSSY</div><div className={styles.brandSmall}>DESIGN</div></div>
        </div>
        <div className={styles.services}>{data.footer.services.slice(0, 3).map(service => <span key={service}>{truncateThaiText(service, 20)}</span>)}</div>
        <div className={styles.cta}>{truncateThaiText(data.footer.cta, 36)}</div>
      </footer>
    </article>
  );
}
