import { ActionIcon, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight, IconHeart, IconLanguage, IconMapPin } from '@tabler/icons-react';
import type { CSSProperties } from 'react';
import type { SchoolRecord } from '../../features/schools/types';

interface SchoolCardProps {
  school: SchoolRecord;
  saved: boolean;
  onToggleSaved: (id: number) => void;
  index: number;
}

export function SchoolCard({ school, saved, onToggleSaved, index }: SchoolCardProps) {
  const navigate = useNavigate();
  const image = school.coverImage;

  return <article className="school-card" style={{ '--card-index': index % 8 } as CSSProperties}>
    <button className="school-image-button" onClick={() => navigate('/schools/' + school.id)} aria-label={'Open ' + school.name}>
      {image ? <img className="school-card-image" src={image} alt={school.name + ' campus'} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
      <span className="image-index">PARTNER / {String(school.id).padStart(3, '0')}</span>
      <span className="image-arrow"><IconArrowRight size={17} /></span>
    </button>
    <div className="school-card-body">
      <div className="school-country"><IconMapPin size={13} />{school.country}<span>{school.erasmus === 'YES' ? 'ERASMUS+' : 'PARTNER'}</span></div>
      <h3><button onClick={() => navigate('/schools/' + school.id)}>{school.name}</button></h3>
      <div className="school-tags">{school.specializations.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
        {school.specializations.length > 3 && <span className="tag-more">+{school.specializations.length - 3}</span>}</div>
      <div className="school-card-stats">
        <div><span>PLACES</span><strong>{school.spots ?? '—'}</strong></div>
        <div><span>MIN GPA</span><strong>{school.gpa ? Number(school.gpa).toFixed(1) : 'OPEN'}</strong></div>
        <div><span>EXTRA COST</span><strong>{school.extracharge ? '€' + Number(school.extracharge).toLocaleString('en-US') : '—'}</strong></div>
      </div>
      <div className="school-card-footer"><span><IconLanguage size={13} />{school.language || 'See details'}</span>
        <Tooltip label={saved ? 'Remove from saved schools' : 'Save school'}>
          <ActionIcon variant="subtle" className={'save-school ' + (saved ? 'saved' : '')} onClick={() => onToggleSaved(school.id)} aria-label={saved ? 'Remove saved school' : 'Save school'}>
            <IconHeart size={17} fill={saved ? 'currentColor' : 'none'} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  </article>;
}
