import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, TextInput } from '@mantine/core';
import {
  IconArrowLeft, IconArrowRight, IconBook2, IconCalendarEvent, IconExternalLink,
  IconFileText, IconLanguage, IconMail, IconMapPin, IconPhone, IconQuestionMark,
  IconShieldCheck, IconWallet,
} from '@tabler/icons-react';
import annexData from '../data/annex-pages.json';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { useLanguage } from '../i18n';

type CmsPage = {
  id: number;
  name: string;
  nameFr: string;
  content: string;
  contentFr?: string;
  updatedAt?: string | null;
};
type ContactPerson = { id: number; name: string; jobTitle: string; jobTitleFr?: string; phone?: string | null; email?: string };
type ContactGroup = { id: number; name: string; nameFr?: string; contacts: ContactPerson[] };
const cmsPages = annexData.pages as CmsPage[];
const contactGroups = annexData.contacts as ContactGroup[];

const slugById: Record<number, string> = {
  4: 'pge4-resources', 5: 'short-term-programs', 6: 'international-insurance',
  7: 'scholarships', 8: 'security-deposit', 9: 'erasmus-plus', 10: 'semester-or-full-year',
};
const iconById = {
  4: IconFileText, 5: IconCalendarEvent, 6: IconShieldCheck,
  7: IconWallet, 8: IconFileText, 9: IconBook2, 10: IconLanguage,
};
const descriptionById: Record<number, { en: string; fr: string }> = {
  4: { en: 'Presentations, recordings and student resources for the PGE4 mobility year.', fr: 'Présentations, replays et ressources étudiantes pour la mobilité PGE4.' },
  5: { en: 'Short summer and winter programs offered by partner universities.', fr: 'Programmes courts d’été et d’hiver proposés par les universités partenaires.' },
  6: { en: 'International insurance providers, coverage details and student offers.', fr: 'Assureurs internationaux, garanties et offres destinées aux étudiants.' },
  7: { en: 'Regional funding options and scholarship information.', fr: 'Aides régionales et informations sur les bourses.' },
  8: { en: 'The conditions published for deposits and withdrawals from mobility.', fr: 'Conditions publiées pour la caution et les désistements de mobilité.' },
  9: { en: 'Eligibility, destinations and information about Erasmus+ mobility.', fr: 'Éligibilité, destinations et informations sur la mobilité Erasmus+.' },
  10: { en: 'Understand the semester and full-year mobility formats.', fr: 'Comprendre les formats de mobilité au semestre ou à l’année.' },
};

function pagePath(page: CmsPage) {
  return `/resources/${slugById[page.id] || 'pge4-resources'}`;
}

function localizeInternalLinks(content: string) {
  return content.replace(/<a\b([^>]*?)href=(['"])https?:\/\/mya\.epitech\.eu\/page\/(\d+)\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (_match, before: string, quote: string, id: string, after: string, labelHtml: string) => {
      const label = labelHtml.replace(/<[^>]*>/g, '').trim().toLowerCase();
      const targetId = (id === '7' && (label.includes('short-term') || label.includes('programme court'))) ? 5 : Number(id);
      const target = targetId === 1 ? '/faq' : targetId === 2 ? '/resources' : targetId === 3 ? '/contact' : slugById[targetId] ? `/resources/${slugById[targetId]}` : null;
      if (!target) return _match;
      const appTarget = `${import.meta.env.BASE_URL}${target.replace(/^\/+/, '')}`;
      return `<a${before}href=${quote}${appTarget}${quote}${after}>${labelHtml}</a>`;
    });
}

function RichContent({ content }: { content: string }) {
  const localized = localizeInternalLinks(content);
  return <div className="annex-rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(localized) }} />;
}

type FaqItem = { question: string; answer: string };
type FaqGroup = { title: string; items: FaqItem[] };
function parseFaq(content: string) {
  const document = new DOMParser().parseFromString(content, 'text/html');
  const groups: FaqGroup[] = [];
  const intro: string[] = [];
  let group: FaqGroup | undefined;
  let item: FaqItem | undefined;
  const saveItem = () => { if (group && item) group.items.push(item); item = undefined; };
  for (const node of [...document.body.children]) {
    const text = (node.textContent || '').replace(/\u00a0/g, ' ').trim();
    if (!text) continue;
    const bold = node.querySelector('strong');
    const allBold = node.tagName === 'P' && bold && bold.textContent?.trim() === text && [...node.children].every((child) => ['STRONG', 'EM'].includes(child.tagName));
    if (allBold && text.endsWith('?')) {
      if (!group) { group = { title: 'Frequently asked questions', items: [] }; groups.push(group); }
      saveItem();
      item = { question: text, answer: '' };
      continue;
    }
    if (allBold) {
      saveItem();
      group = { title: text, items: [] };
      groups.push(group);
      continue;
    }
    if (item) item.answer += node.outerHTML;
    else intro.push(node.outerHTML);
  }
  saveItem();
  return { intro: intro.join(''), groups: groups.filter((section) => section.items.length) };
}

function PageHeading({ eyebrow, title, description, color = 'blue' }: { eyebrow: string; title: string; description: string; color?: string }) {
  const { t } = useLanguage();
  return <div className="annex-heading">
    <div className="eyebrow">{t('INTERNATIONAL MOBILITY')} <span>/</span> {t(eyebrow).toUpperCase()}</div>
    <h2>{title.toUpperCase()}<span className={`title-caret annex-caret-${color}`}>_</span></h2>
    <p>{description}</p>
  </div>;
}


export function ResourcesPage() {
  const { language } = useLanguage();
  const resources = useMemo(() => cmsPages.filter((page) => page.id >= 4 && page.id <= 10), []);
  return <section className="page-section annex-page">
    <div className="annex-topline"><PageHeading eyebrow="Useful resources" title={language === 'fr' ? 'Ressources utiles' : 'Useful resources'} description={language === 'fr' ? 'Guides et informations pratiques pour préparer votre mobilité internationale.' : 'Guides and practical information to prepare your international mobility.'} />
      </div>
    <div className="annex-feature-links">
      <Link to="/faq" className="annex-feature-link annex-feature-link--faq"><span className="annex-feature-icon"><IconQuestionMark size={21} /></span><span><small>{language === 'fr' ? 'DES RÉPONSES À VOS QUESTIONS' : 'ANSWERS TO COMMON QUESTIONS'}</small><strong>FAQ</strong></span><IconArrowRight size={18} /></Link>
      <Link to="/contact" className="annex-feature-link annex-feature-link--contact"><span className="annex-feature-icon"><IconMail size={19} /></span><span><small>{language === 'fr' ? 'BESOIN D’UN CONTACT ?' : 'NEED TO REACH THE TEAM?'}</small><strong>{language === 'fr' ? 'Relations internationales' : 'International Affairs'}</strong></span><IconArrowRight size={18} /></Link>
    </div>
    <div className="annex-section-title"><div><span className="eyebrow">{language === 'fr' ? 'BIBLIOTHÈQUE DE RESSOURCES' : 'REFERENCE LIBRARY'} <span>/</span> {resources.length} {language === 'fr' ? 'PAGES' : 'PAGES'}</span><h3>{language === 'fr' ? 'Guides de mobilité' : 'Mobility guides'}</h3></div><span className="annex-updated-label">{language === 'fr' ? 'SOURCE : MYA EPITECH' : 'SOURCE: MYA EPITECH'}</span></div>
    <div className="annex-resource-grid">
      {resources.map((page, index) => {
        const Icon = iconById[page.id as keyof typeof iconById] || IconFileText;
        const name = language === 'fr' ? page.nameFr || page.name : page.name;
        const description = descriptionById[page.id]?.[language] || '';
        return <Link to={pagePath(page)} className={`annex-resource-card annex-accent-${index % 4}`} key={page.id}>
          <span className="annex-resource-card-icon"><Icon size={18} stroke={1.8} /></span><span className="annex-resource-index">0{index + 1}</span>
          <strong>{name}</strong><p>{description}</p><span className="annex-resource-card-bottom"><span>{language === 'fr' ? 'OUVRIR LA RESSOURCE' : 'OPEN RESOURCE'}</span><IconArrowRight size={15} /></span>
        </Link>;
      })}
    </div>
    <p className="annex-source-note"><IconFileText size={14} />{language === 'fr' ? 'Contenus repris des pages publiques de MYA. Certaines dates et conditions dépendent de l’année de mobilité ; vérifiez les échéances actuelles auprès des relations internationales.' : 'Content reproduced from MYA pages. Some dates and conditions depend on the mobility year; confirm current deadlines with International Affairs.'}</p>
  </section>;
}

export function FaqPage() {
  const page = cmsPages.find((item) => item.id === 1)!;
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const source = language === 'fr' && page.contentFr ? page.contentFr : page.content;
  const parsed = useMemo(() => parseFaq(source), [source]);
  const filteredGroups = parsed.groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !query || `${item.question} ${item.answer.replace(/<[^>]*>/g, ' ')}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())),
  })).filter((group) => group.items.length);
  const total = parsed.groups.reduce((count, group) => count + group.items.length, 0);
  return <section className="page-section annex-page">
    <div className="annex-topline"><div><PageHeading eyebrow="FAQ" title={language === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'} description={language === 'fr' ? 'Les réponses aux questions courantes sur votre mobilité internationale.' : 'Answers to common questions about your international mobility.'} /></div></div>
    <div className="faq-toolbar"><TextInput leftSection={<IconQuestionMark size={16} />} placeholder={language === 'fr' ? 'Rechercher dans la FAQ' : 'Search the FAQ'} value={query} onChange={(event) => setQuery(event.currentTarget.value)} aria-label={language === 'fr' ? 'Rechercher dans la FAQ' : 'Search the FAQ'} />
      <span>{query ? `${filteredGroups.reduce((count, group) => count + group.items.length, 0)} / ` : ''}{total} {language === 'fr' ? 'questions' : 'questions'}</span></div>
    {parsed.intro && <div className="annex-rich-content faq-intro"><RichContent content={parsed.intro} /></div>}
    <div className="faq-layout">
      <nav className="faq-index" aria-label={language === 'fr' ? 'Sections de la FAQ' : 'FAQ sections'}><span className="eyebrow">{language === 'fr' ? 'DANS CETTE PAGE' : 'ON THIS PAGE'}</span>{filteredGroups.map((group, index) => <a href={`#faq-section-${index}`} key={`${group.title}-${index}`}>{group.title}<small>{group.items.length.toString().padStart(2, '0')}</small></a>)}</nav>
      <div className="faq-content">{filteredGroups.map((group, index) => <section className="faq-section" id={`faq-section-${index}`} key={`${group.title}-${index}`}>
        <div className="faq-section-heading"><span>0{index + 1}</span><h3>{group.title}</h3></div>
        {group.items.map((item, questionIndex) => <details className="faq-item" key={`${item.question}-${questionIndex}`}>
          <summary><span>{item.question}</span><i aria-hidden="true" /></summary>
          <RichContent content={item.answer} />
        </details>)}
      </section>)}
      {!filteredGroups.length && <div className="faq-no-results"><IconQuestionMark size={22} /><strong>{language === 'fr' ? 'Aucun résultat' : 'No matching questions'}</strong><span>{language === 'fr' ? 'Essayez un autre terme.' : 'Try a different search term.'}</span></div>}</div>
    </div>
    <div className="annex-bottom-actions"><Button component={Link} to="/resources" variant="default" leftSection={<IconBook2 size={15} />}>{language === 'fr' ? 'Toutes les ressources' : 'All resources'}</Button><Button component={Link} to="/contact" variant="light" leftSection={<IconMail size={15} />}>{language === 'fr' ? 'Contacter l’équipe' : 'Contact the team'}</Button></div>
  </section>;
}

export function ResourceDetailPage() {
  const { slug } = useParams();
  const page = cmsPages.find((item) => slugById[item.id] === slug);
  const { language } = useLanguage();
  if (!page) return <section className="page-section annex-page"><PageHeading eyebrow="RESOURCE" title={language === 'fr' ? 'Page introuvable' : 'Page not found'} description={language === 'fr' ? 'Cette ressource est indisponible.' : 'This resource is not available.'} /><Button component={Link} to="/resources" leftSection={<IconArrowLeft size={15} />}>{language === 'fr' ? 'Retour aux ressources' : 'Back to resources'}</Button></section>;
  const french = language === 'fr' && Boolean(page.contentFr);
  const name = french ? page.nameFr || page.name : page.name;
  const date = page.updatedAt ? new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(page.updatedAt)) : null;
  return <section className="page-section annex-page">
    <div className="annex-article-topline"><Button component={Link} to="/resources" variant="subtle" size="xs" leftSection={<IconArrowLeft size={14} />}>{french ? 'Toutes les ressources' : 'All resources'}</Button></div>
    <div className="annex-article-heading"><div className="eyebrow">INTERNATIONAL MOBILITY <span>/</span> {french ? 'RESSOURCES UTILES' : 'USEFUL RESOURCES'}</div><h2>{name.toUpperCase()}<span className="title-caret">_</span></h2><div className="annex-article-meta"><span><IconBook2 size={13} />{french ? 'GUIDE DE MOBILITÉ' : 'MOBILITY GUIDE'}</span>{date && <span><IconCalendarEvent size={13} />{french ? 'MIS À JOUR LE' : 'UPDATED'} {date}</span>}</div></div>
    <article className="annex-article"><RichContent content={french ? page.contentFr || page.content : page.content} /></article>
    <p className="annex-source-note"><IconFileText size={14} />{french ? 'Contenu repris de MYA. Certaines dates et conditions dépendent de l’année de mobilité ; vérifiez les échéances actuelles auprès des relations internationales.' : 'Content reproduced from MYA. Some dates and conditions depend on the mobility year; confirm current deadlines with International Affairs.'}</p>
    <div className="annex-bottom-actions"><Button component={Link} to="/resources" variant="default" leftSection={<IconArrowLeft size={15} />}>{french ? 'Retour aux ressources' : 'Back to resources'}</Button><Button component={Link} to="/faq" variant="light" rightSection={<IconArrowRight size={15} />}>FAQ</Button></div>
  </section>;
}

export function ContactPage() {
  const { language } = useLanguage();
  return <section className="page-section annex-page">
    <div className="annex-topline"><PageHeading eyebrow="CONTACT" title={language === 'fr' ? 'Relations internationales' : 'International Affairs'} description={language === 'fr' ? 'Les interlocuteurs de l’équipe des relations internationales.' : 'Reach the right people in the International Affairs team.'} /></div>
    <div className="contact-group-grid">{contactGroups.map((group, groupIndex) => <section className={`contact-group-card annex-accent-${groupIndex % 4}`} key={group.id}>
      <div className="contact-group-heading"><span>0{groupIndex + 1}</span><h3>{language === 'fr' ? group.nameFr || group.name : group.name}</h3></div>
      {group.contacts.map((person) => <article className="contact-person" key={person.id}>
        <div className="contact-person-mark">{person.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</div><div className="contact-person-details"><strong>{person.name}</strong><span>{language === 'fr' ? person.jobTitleFr || person.jobTitle : person.jobTitle}</span><div className="contact-methods">{person.email && <a href={`mailto:${person.email}`}><IconMail size={13} />{person.email}</a>}{person.phone && <a href={`tel:${person.phone.replace(/\s/g, '')}`}><IconPhone size={13} />{person.phone}</a>}</div></div>
      </article>)}
    </section>)}</div>
    <div className="contact-address"><IconMapPin size={16} /><span><strong>EPITECH · International Affairs Office</strong><small>24 rue Pasteur, 94270 Le Kremlin-Bicêtre, France</small></span><a href="mailto:international-relations@epitech.eu">international-relations@epitech.eu<IconExternalLink size={13} /></a></div>
    <p className="annex-source-note"><IconFileText size={14} />{language === 'fr' ? 'Contacts repris des informations publiques de MYA.' : 'Contact details reproduced from MYA public information.'}</p>
  </section>;
}
