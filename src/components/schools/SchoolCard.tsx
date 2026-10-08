import { ActionIcon, Textarea, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight, IconGitCompare, IconHeart, IconLanguage, IconMapPin } from '@tabler/icons-react';
import type { CSSProperties } from 'react';
import type { FavoriteDetails, SchoolRecord } from '../../features/schools/types';

interface SchoolCardProps {
  school: SchoolRecord;
  saved: boolean;
  onToggleSaved: (id: number) => void;
  compared?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (id: number) => void;
  showFavoriteEditor?: boolean;
  favoriteDetails?: FavoriteDetails;
  onFavoriteDetailsChange?: (id: number, details: FavoriteDetails) => void;
  index: number;
}

export function SchoolCard({ school, saved, onToggleSaved, compared = false, compareDisabled = false, onToggleCompare, showFavoriteEditor = false, favoriteDetails, onFavoriteDetailsChange, index }: SchoolCardProps) {
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
        <div className="school-card-actions">
          {onToggleCompare && <Tooltip label={compareDisabled && !compared ? 'Comparison is limited to four schools' : compared ? 'Remove from comparison' : 'Add to comparison'}>
            <ActionIcon variant="subtle" className={'compare-school ' + (compared ? 'selected' : '')} onClick={() => onToggleCompare(school.id)} disabled={compareDisabled && !compared}
              aria-label={compared ? 'Remove from comparison' : compareDisabled ? 'Comparison is full, limited to four schools' : 'Add to comparison'} aria-pressed={compared}>
              <IconGitCompare size={17} />
            </ActionIcon>
          </Tooltip>}
          <Tooltip label={saved ? 'Remove from saved schools' : 'Save school'}>
            <ActionIcon variant="subtle" className={'save-school ' + (saved ? 'saved' : '')} onClick={() => onToggleSaved(school.id)} aria-label={saved ? 'Remove saved school' : 'Save school'} aria-pressed={saved}>
              <IconHeart size={17} fill={saved ? 'currentColor' : 'none'} />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      {showFavoriteEditor && favoriteDetails && onFavoriteDetailsChange && <div className="saved-card-details">
        <label>Priority<select aria-label={`Priority for ${school.name}`} value={favoriteDetails.priority} onChange={(event) => onFavoriteDetailsChange(school.id, { ...favoriteDetails, priority: event.currentTarget.value as FavoriteDetails['priority'] })}>
          <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
        <Textarea label="Personal note" aria-label={`Personal note for ${school.name}`} value={favoriteDetails.note} autosize minRows={1} maxRows={3} maxLength={1000} placeholder="Add a note for your shortlist…"
          onChange={(event) => onFavoriteDetailsChange(school.id, { ...favoriteDetails, note: event.currentTarget.value })} />
      </div>}
    </div>
  </article>;
}
