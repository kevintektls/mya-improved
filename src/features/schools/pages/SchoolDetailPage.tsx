import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Tabs } from '@mantine/core';
import { IconArrowLeft, IconBook2, IconBuildingCommunity, IconCalendar, IconCurrencyEuro, IconFileText, IconGitCompare, IconHeart, IconLanguage, IconMapPin, IconUsers, IconWorld } from '@tabler/icons-react';
import type { SchoolRecord } from '../types';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { fetchSchoolDetails } from '../data/schools';

type DetailSectionKey = 'overview' | 'administrative' | 'accomodation' | 'courses' | 'cost';
const detailSections: { key: DetailSectionKey; label: string; icon: typeof IconWorld }[] = [
  { key: 'overview', label: 'Overview', icon: IconWorld },
  { key: 'administrative', label: 'Application & admin', icon: IconFileText },
  { key: 'accomodation', label: 'Accommodation', icon: IconBuildingCommunity },
  { key: 'courses', label: 'Courses', icon: IconBook2 },
  { key: 'cost', label: 'Cost of living', icon: IconCurrencyEuro },
];

export function SchoolDetail({ schools, saved, toggleSaved, compared, toggleCompared }: { schools: SchoolRecord[]; saved: number[]; toggleSaved: (id: number) => void; compared: number[]; toggleCompared: (id: number) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const summary = schools.find((item) => String(item.id) === id);
  const [school, setSchool] = useState<Awaited<ReturnType<typeof fetchSchoolDetails>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailSectionKey>('overview');
  const [failedImages, setFailedImages] = useState<number[]>([]);

  useEffect(() => {
    if (!summary) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setSchool(null);
    setFailedImages([]);
    setActiveTab('overview');
    fetchSchoolDetails(summary.id)
      .then((details) => {
        if (!cancelled) setSchool({ ...details, ...summary });
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Could not load this school profile.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [summary, retryCount]);

  if (!summary) return <section className="page-section"><div className="empty-results"><h3>School not found</h3><Button onClick={() => navigate('/schools')}>Back to schools</Button></div></section>;
  if (loadError) return <section className="page-section"><div className="catalog-load-error"><strong>School profile unavailable</strong><span>{loadError}</span><Button size="xs" variant="default" onClick={() => setRetryCount((count) => count + 1)}>Retry</Button></div></section>;
  if (loading || !school || school.id !== summary.id) return <div className="catalog-loading"><span className="loading-mark" /> Loading school profile…</div>;

  const images = (school.images || []).map((src, index) => ({ src, index })).filter(({ index }) => !failedImages.includes(index));
  const savedThis = saved.includes(school.id);
  const detailHtml = school[activeTab] || '<p>No information is available for this section yet.</p>';

  return <section className="page-section school-detail">
    <button className="back-link" onClick={() => navigate('/schools')}><IconArrowLeft size={15} /> Back to partner schools</button>
    <div className="detail-heading">
      <div><div className="eyebrow">PARTNER DIRECTORY <span>/</span> {school.country.toUpperCase()} <span>/</span> PROFILE</div>
        <h2>{school.name.toUpperCase()}<span className="title-caret">_</span></h2>
        <div className="detail-badges"><Badge variant="light" color="blue"><IconMapPin size={12} />{school.country}</Badge>
          {school.erasmus === 'YES' && <Badge variant="light" color="teal">ERASMUS+</Badge>}
          <Badge variant="light" color="gray">{school.semester || 'Duration not specified'}</Badge>
          <Badge variant="light" color={school.updatedAt && Number.isFinite(new Date(school.updatedAt).getTime()) ? 'gray' : 'orange'}>
            {school.updatedAt && Number.isFinite(new Date(school.updatedAt).getTime()) ? `DATA UPDATED ${new Date(school.updatedAt).toLocaleDateString('en-GB')}` : 'DATA DATE NOT PROVIDED'}
          </Badge>
        </div>
      </div>
      <div className="detail-actions">
        <Button className={'compare-detail ' + (compared.includes(school.id) ? 'selected' : '')} variant="default"
          leftSection={<IconGitCompare size={15} />} onClick={() => toggleCompared(school.id)} disabled={compared.length >= 4 && !compared.includes(school.id)} aria-pressed={compared.includes(school.id)}>
          {compared.includes(school.id) ? 'In comparison' : 'Compare'}
        </Button>
        <Button className={'save-detail ' + (savedThis ? 'saved' : '')} variant={savedThis ? 'filled' : 'default'}
          leftSection={<IconHeart size={15} fill={savedThis ? 'currentColor' : 'none'} />} onClick={() => toggleSaved(school.id)}>
          {savedThis ? 'Saved' : 'Save school'}
        </Button>
      </div>
    </div>

    <div className="detail-layout">
      <div className="detail-main-column">
        <div className={'detail-gallery gallery-count-' + images.length}>
          {images.length ? images.map(({ src, index }) => <div className={'gallery-image gallery-image-' + index} key={src}>
            <img src={src} alt={school.name + ' campus ' + (index + 1)} onError={() => setFailedImages((current) => current.includes(index) ? current : [...current, index])} />
            <span>IMAGE 0{index + 1}</span>
          </div>) : <div className="gallery-empty"><IconWorld size={36} /><span>Campus images unavailable</span></div>}
        </div>
        <section className="panel detail-copy-panel">
          <div className="detail-tabs-header"><div className="panel-label">SCHOOL INFORMATION<span>_</span></div>
          <span className="last-updated">Data source · Epitech</span></div>
        <Tabs value={activeTab} onChange={(value) => setActiveTab((value as DetailSectionKey | null) || 'overview')} variant="outline" className="detail-tabs">
            <Tabs.List>{detailSections.map((section) => { const Icon = section.icon; return <Tabs.Tab key={section.key} value={section.key} leftSection={<Icon size={14} />}>{section.label}</Tabs.Tab>; })}</Tabs.List>
            <Tabs.Panel value={activeTab} pt="lg"><div className="detail-rich-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(detailHtml) }} /></Tabs.Panel>
          </Tabs>
        </section>
      </div>

      <aside className="detail-aside">
        <section className="panel quick-facts">
          <div className="panel-label">AT A GLANCE<span>_</span></div>
          <div className="fact-score"><span>GPA REQUIREMENT</span><strong>{school.gpa ? Number(school.gpa).toFixed(1) : 'OPEN'}</strong><small>{school.gpa ? 'minimum average' : 'no minimum specified'}</small></div>
          <div className="fact-row"><span><IconUsers size={15} />Available places</span><strong>{school.spots ?? 'Not specified'}</strong></div>
          <div className="fact-row"><span><IconLanguage size={15} />Instruction language</span><strong>{school.language || 'Not specified'}</strong></div>
          <div className="fact-row"><span><IconCalendar size={15} />Study period</span><strong>{school.semester || 'Not specified'}</strong></div>
          <div className="fact-row"><span><IconCurrencyEuro size={15} />Extra charge</span><strong>{school.extracharge ? '€' + Number(school.extracharge).toLocaleString('en-US') : 'None listed'}</strong></div>
          <div className="fact-row"><span><IconBook2 size={15} />Diploma</span><strong>{school.diploma === 'YES' ? 'Available' : school.diploma === 'NO' ? 'Not available' : 'Not specified'}</strong></div>
          <div className="fact-row"><span><IconWorld size={15} />Erasmus+</span><strong>{school.erasmus || 'Not specified'}</strong></div>
        </section>
        <section className="panel specialization-panel"><div className="panel-label">STUDY AREAS<span>_</span></div>
          <div className="detail-specializations">{(school.specializations || []).length ? school.specializations.map((item) => <span key={item}>{item}</span>) : <small>No specializations listed.</small>}</div>
        </section>
        <div className="source-note"><IconFileText size={14} /><span>Profile content from MYA Epitech partner data.</span></div>
      </aside>
    </div>
  </section>;
}
