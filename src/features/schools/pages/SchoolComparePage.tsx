import { useNavigate } from 'react-router-dom';
import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { IconArrowRight, IconGitCompare, IconX } from '@tabler/icons-react';
import type { SchoolRecord } from '../types';

const compareRows: { label: string; value: (school: SchoolRecord) => string }[] = [
  { label: 'Country', value: (school) => school.country || 'Not specified' },
  { label: 'Study areas', value: (school) => school.specializations.join(', ') || 'Not specified' },
  { label: 'Available places', value: (school) => String(school.spots || 'Not specified') },
  { label: 'Minimum GPA', value: (school) => school.gpa > 0 ? school.gpa.toFixed(1) : 'Open' },
  { label: 'Extra cost', value: (school) => school.extracharge > 0 ? `€${school.extracharge.toLocaleString('en-US')}` : 'None listed' },
  { label: 'Instruction language', value: (school) => school.language || 'Not specified' },
  { label: 'Study period', value: (school) => school.semester || 'Not specified' },
  { label: 'Diploma', value: (school) => school.diploma === 'YES' ? 'Available' : school.diploma === 'NO' ? 'Not available' : 'Not specified' },
  { label: 'Erasmus+', value: (school) => school.erasmus || 'Not specified' },
];

export function SchoolComparePage({ schools, onRemove, onClear }: { schools: SchoolRecord[]; onRemove: (id: number) => void; onClear: () => void }) {
  const navigate = useNavigate();
  return <section className="page-section compare-page">
    <div className="section-heading"><div><div className="eyebrow">INTERNATIONAL MOBILITY <span>/</span> DECISION TOOL</div>
      <h2>COMPARE DESTINATIONS<span className="title-caret">_</span></h2>
      <p className="section-deck">Review the same study and mobility details side by side.</p></div>
      <div className="directory-result-count"><strong>{schools.length}</strong><span>OF 4 SCHOOLS</span></div>
    </div>
    {!schools.length ? <div className="empty-results"><IconGitCompare size={27} /><h3>Your comparison is empty</h3>
      <p>Add up to four schools from the directory to compare their exchange options.</p>
      <Button size="xs" onClick={() => navigate('/schools')}>Browse partner schools <IconArrowRight size={14} /></Button></div> : <>
      <div className="compare-toolbar"><span>{schools.length === 1 ? 'Add another destination to make a comparison.' : `${schools.length} destinations selected · up to 4`}</span>
        <div><Button variant="default" size="xs" onClick={() => navigate('/schools')}>Add schools</Button><Button variant="subtle" color="gray" size="xs" onClick={onClear}>Clear all</Button></div>
      </div>
      <div className="comparison-table-wrap" role="region" aria-label="University comparison" tabIndex={0}>
        <table className="comparison-table"><thead><tr><th scope="col" className="comparison-label-cell">DETAIL</th>
          {schools.map((school) => <th scope="col" key={school.id}>
            <div className="comparison-school-head">{school.coverImage && <img src={school.coverImage} alt="" />}
              <div><button className="comparison-school-name" onClick={() => navigate(`/schools/${school.id}`)}>{school.name}</button><span>{school.country}</span></div>
              <Tooltip label={`Remove ${school.name}`}><ActionIcon variant="subtle" size="sm" aria-label={`Remove ${school.name} from comparison`} onClick={() => onRemove(school.id)}><IconX size={15} /></ActionIcon></Tooltip>
            </div>
          </th>)}
        </tr></thead><tbody>{compareRows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>
          {schools.map((school) => <td key={school.id}>{row.value(school)}</td>)}</tr>)}</tbody></table>
      </div>
    </>}
  </section>;
}
