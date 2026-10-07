import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Tabs } from '@mantine/core';
import { IconArrowLeft, IconBook2, IconBuildingCommunity, IconCalendar, IconCurrencyEuro, IconFileText, IconHeart, IconLanguage, IconMapPin, IconUsers, IconWorld } from '@tabler/icons-react';
import type { SchoolRecord } from '../types';
import { sanitizeHtml } from '../utils/sanitizeHtml';

type DetailSectionKey = 'overview' | 'administrative' | 'accomodation' | 'courses' | 'cost';
const detailSections: { key: DetailSectionKey; label: string; icon: typeof IconWorld }[] = [
  { key: 'overview', label: 'Overview', icon: IconWorld },
  { key: 'administrative', label: 'Application & admin', icon: IconFileText },
  { key: 'accomodation', label: 'Accommodation', icon: IconBuildingCommunity },
  { key: 'courses', label: 'Courses', icon: IconBook2 },
  { key: 'cost', label: 'Cost of living', icon: IconCurrencyEuro },
];

export function SchoolDetail({ schools, saved, toggleSaved }: { schools: SchoolRecord[]; saved: number[]; toggleSaved: (id: number) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const school = schools.find((item) => String(item.id) === id);
  const [activeTab, setActiveTab] = useState<DetailSectionKey>('overview');
  const [failedImages, setFailedImages] = useState<number[]>([]);

  if (!school) return <section className="page-section"><div className="empty-results"><h3>School not found</h3><Button onClick={() => navigate('/schools')}>Back to schools</Button></div></section>;
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
        </div>
      </div>
      <Button className={'save-detail ' + (savedThis ? 'saved' : '')} variant={savedThis ? 'filled' : 'default'}
        leftSection={<IconHeart size={15} fill={savedThis ? 'currentColor' : 'none'} />} onClick={() => toggleSaved(school.id)}>
        {savedThis ? 'Saved' : 'Save school'}
      </Button>
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
            <span className="last-updated">UPDATED {school.updatedAt ? new Date(school.updatedAt).toLocaleDateString('en-GB') : '—'}</span></div>
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
