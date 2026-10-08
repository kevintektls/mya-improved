import { Button } from '@mantine/core';
import { IconGitCompare, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { SchoolRecord } from '../../features/schools/types';

export function ComparisonTray({ schools, onRemove, onClear }: { schools: SchoolRecord[]; onRemove: (id: number) => void; onClear: () => void }) {
  const navigate = useNavigate();
  if (!schools.length) return null;
  return <aside className="comparison-tray" aria-label="Selected schools for comparison" aria-live="polite">
    <div className="comparison-tray-summary"><IconGitCompare size={17} /><strong>{schools.length} / 4</strong><span>{schools.length === 1 ? 'school selected' : 'schools selected'}</span></div>
    <div className="comparison-tray-schools">{schools.map((school) => <span key={school.id} className="comparison-tray-school">
      {school.name}<button type="button" aria-label={`Remove ${school.name} from comparison`} onClick={() => onRemove(school.id)}><IconX size={12} /></button>
    </span>)}</div>
    <div className="comparison-tray-actions"><Button size="xs" onClick={() => navigate('/compare')}>Compare</Button><button type="button" className="tray-clear" onClick={onClear}>Clear</button></div>
  </aside>;
}
