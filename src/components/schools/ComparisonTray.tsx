import { Button } from '@mantine/core';
import { IconGitCompare, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { SchoolRecord } from '../../features/schools/types';
import { translatedSchoolName, useLanguage } from '../../features/schools/i18n';

export function ComparisonTray({ schools, onRemove, onClear }: { schools: SchoolRecord[]; onRemove: (id: number) => void; onClear: () => void }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  if (!schools.length) return null;
  return <aside className="comparison-tray" aria-label={t('Selected schools for comparison')} aria-live="polite">
    <div className="comparison-tray-summary"><IconGitCompare size={17} /><strong>{schools.length} / 4</strong><span>{language === 'fr' ? `${schools.length} université${schools.length > 1 ? 's' : ''} sélectionnée${schools.length > 1 ? 's' : ''}` : `${schools.length} ${schools.length === 1 ? 'school' : 'schools'} selected`}</span></div>
    <div className="comparison-tray-schools">{schools.map((school) => <span key={school.id} className="comparison-tray-school">
      {translatedSchoolName(school.name, school.nameFr, language)}<button type="button" aria-label={`${t('Remove')} ${translatedSchoolName(school.name, school.nameFr, language)} ${t('from comparison')}`} onClick={() => onRemove(school.id)}><IconX size={12} /></button>
    </span>)}</div>
    <div className="comparison-tray-actions"><Button size="xs" onClick={() => navigate('/compare')}>{t('Compare')}</Button><button type="button" className="tray-clear" onClick={onClear}>{t('Clear')}</button></div>
  </aside>;
}
