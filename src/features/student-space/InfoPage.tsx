import { IconFileText } from '@tabler/icons-react';

export function InfoPage({ title, copy }: { title: string; copy: string }) {
  return <section className="page-section discovery-page"><div className="section-heading"><div><div className="eyebrow">MY JOURNEY <span>/</span> STUDENT SPACE</div><h2>{title.toUpperCase()}<span className="title-caret">_</span></h2></div></div>
    <section className="panel info-panel"><IconFileText size={25} /><div><div className="panel-label">STUDENT WORKSPACE<span>_</span></div><h3>{title}</h3><p>{copy}</p></div></section>
  </section>;
}
