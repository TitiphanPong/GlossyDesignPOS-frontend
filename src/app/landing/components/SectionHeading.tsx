import styles from '../landing.module.css';

type SectionHeadingProps = Readonly<{
  eyebrow: string;
  title: string;
  lead: string;
  titleId: string;
}>;

export function SectionHeading({ eyebrow, title, lead, titleId }: SectionHeadingProps) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId} className={styles.sectionTitle}>
          {title}
        </h2>
      </div>
      <p className={styles.sectionLead}>{lead}</p>
    </div>
  );
}
