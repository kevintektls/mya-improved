import { useNavigate } from 'react-router-dom';
import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconArrowRight, IconGitCompare, IconX } from '@tabler/icons-react';
import type { SchoolRecord } from '../types';
import { translatedData, translatedLanguageList, translatedSchoolName, useLanguage } from '../i18n';

const compareRows = ['Country', 'Study areas', 'Available places', 'Minimum GPA', 'Extra cost', 'Instruction language', 'Study period', 'Diploma', 'Erasmus+'];

export function SchoolComparePage({ schools, onRemove, onClear }: { schools: SchoolRecord[]; onRemove: (id: number) => void; onClear: () => void }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const valueFor = (label: string, school: SchoolRecord) => {
    if (label === 'Country') return translatedData(school.country || t('Not specified'), 'countries', language);
    if (label === 'Study areas') return school.specializations.map((item) => translatedData(item, 'specializations', language)).join(', ') || t('Not specified');
    if (label === 'Available places') return String(school.spots || t('Not specified'));
    if (label === 'Minimum GPA') return school.gpa > 0 ? school.gpa.toFixed(1) : t('Open');
    if (label === 'Extra cost') return school.extracharge > 0 ? `€${school.extracharge.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}` : t('None listed');
    if (label === 'Instruction language') return school.language ? translatedLanguageList(school.language, language) : t('Not specified');
    if (label === 'Study period') return school.semester ? t(school.semester) : t('Not specified');
    if (label === 'Diploma') return school.diploma === 'YES' ? t('Available') : school.diploma === 'NO' ? t('Not available') : t('Not specified');
    return school.erasmus === 'YES' ? 'Erasmus+' : school.erasmus === 'NO' ? t('No') : t('Not specified');
  };
  return <section className="page-section compare-page">
    <div className="section-heading"><div><div className="eyebrow">{t('INTERNATIONAL MOBILITY')} <span>/</span> {t('DECISION TOOL')}</div>
      <h2>{t('COMPARE DESTINATIONS')}<span className="title-caret">_</span></h2>
      <p className="section-deck">{t('Review the same study and mobility details side by side.')}</p></div>
      <div className="directory-result-count"><strong>{schools.length}</strong><span>{t('OF 4 SCHOOLS')}</span></div>
    </div>
    {!schools.length ? <div className="empty-results"><IconGitCompare size={27} /><h3>{t('Your comparison is empty')}</h3>
      <p>{t('Add up to four schools from the directory to compare their exchange options.')}</p>
      <Button size="xs" onClick={() => navigate('/schools')}>{t('Browse partner schools')} <IconArrowRight size={14} /></Button></div> : <>
      <div className="compare-toolbar"><span>{schools.length === 1 ? t('Add another destination to make a comparison.') : language === 'fr' ? `${schools.length} destinations sélectionnées · jusqu’à 4` : `${schools.length} destinations selected · up to 4`}</span>
        <div><Button variant="default" size="xs" onClick={() => navigate('/schools')}>{t('Add schools')}</Button><Button variant="subtle" color="gray" size="xs" onClick={onClear}>{t('Clear all')}</Button></div>
      </div>
      <div className="comparison-table-wrap" role="region" aria-label={t('University comparison')} tabIndex={0}>
        <table className="comparison-table"><thead><tr><th scope="col" className="comparison-label-cell">{t('DETAIL')}</th>
          {schools.map((school) => <th scope="col" key={school.id}>
            <div className="comparison-school-head">{school.coverImage && <img src={school.coverImage} alt="" />}
              <div><button className="comparison-school-name" onClick={() => navigate(`/schools/${school.id}`)}>{translatedSchoolName(school.name, school.nameFr, language)}</button><span>{translatedData(school.country, 'countries', language)}</span></div>
              <Tooltip label={`${t('Remove')} ${translatedSchoolName(school.name, school.nameFr, language)}`}><ActionIcon variant="subtle" size="sm" aria-label={`${t('Remove')} ${translatedSchoolName(school.name, school.nameFr, language)} ${t('from comparison')}`} onClick={() => onRemove(school.id)}><IconX size={15} /></ActionIcon></Tooltip>
            </div>
          </th>)}
        </tr></thead><tbody>{compareRows.map((row) => <tr key={row}><th scope="row">{t(row)}</th>
          {schools.map((school) => <td key={school.id}>{valueFor(row, school)}</td>)}</tr>)}</tbody></table>
      </div>
    </>}
  </section>;
}
