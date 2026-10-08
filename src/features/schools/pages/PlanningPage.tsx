import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Checkbox, NumberInput, Pagination, Tabs, TextInput } from '@mantine/core';
import { IconArrowRight, IconCalendar, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { MultiFilter } from '../../../components/schools/MultiFilter';
import { DEFAULT_PREFERENCES, defaultChecklist } from '../data/studentWorkspace';
import { matchSchools } from '../utils/schoolMatching';
import type { ChecklistTask, PlanningPreferences, SchoolRecord } from '../types';

interface PlanningPageProps {
  schools: SchoolRecord[];
  preferences: PlanningPreferences;
  onPreferencesChange: (preferences: PlanningPreferences) => void;
  checklists: Record<number, ChecklistTask[]>;
  onChecklistChange: (schoolId: number, tasks: ChecklistTask[]) => void;
}

export function PlanningPage({ schools, preferences, onPreferencesChange, checklists, onChecklistChange }: PlanningPageProps) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') === 'checklist' ? 'checklist' : 'matches';
  const selectedSchoolId = Number(params.get('school')) || 0;
  const selectedSchool = schools.find((school) => school.id === selectedSchoolId);
  const matches = useMemo(() => matchSchools(schools, preferences), [schools, preferences]);
  const [matchPage, setMatchPage] = useState(1);
  const matchPageSize = 12;
  const matchPageCount = Math.ceil(matches.length / matchPageSize);
  const visibleMatches = matches.slice((matchPage - 1) * matchPageSize, matchPage * matchPageSize);
  const languages = useMemo(() => [...new Set(schools.flatMap((school) => school.language.split(/[,/;]|\s+and\s+/i).map((item) => item.trim()).filter(Boolean)))].sort(), [schools]);
  const updatePreference = <K extends keyof PlanningPreferences>(key: K, value: PlanningPreferences[K]) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  useEffect(() => {
    if (selectedSchoolId && selectedSchool && !checklists[selectedSchoolId]) onChecklistChange(selectedSchoolId, defaultChecklist());
  }, [selectedSchoolId, selectedSchool, checklists, onChecklistChange]);

  useEffect(() => setMatchPage(1), [preferences]);

  const updateChecklist = (tasks: ChecklistTask[]) => {
    if (selectedSchoolId) onChecklistChange(selectedSchoolId, tasks);
  };

  const openChecklist = (schoolId: number) => {
    const next = new URLSearchParams(params);
    next.set('tab', 'checklist');
    next.set('school', String(schoolId));
    setParams(next);
  };

  return <section className="page-section planning-page">
    <div className="section-heading"><div><div className="eyebrow">MY JOURNEY <span>/</span> DESTINATION PLANNER</div>
      <h2>PLAN YOUR EXCHANGE<span className="title-caret">_</span></h2>
      <p className="section-deck">Find partner schools that match your requirements and keep your next steps in one place.</p></div>
    </div>
    <Tabs value={activeTab} onChange={(value) => {
      const next = new URLSearchParams(params);
      next.set('tab', value || 'matches');
      setParams(next);
    }} className="planning-tabs">
      <Tabs.List><Tabs.Tab value="matches" leftSection={<IconArrowRight size={15} />}>Find my destinations</Tabs.Tab>
        <Tabs.Tab value="checklist" leftSection={<IconCalendar size={15} />}>Application checklist</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="matches" pt="md">
        <div className="planner-layout">
          <section className="panel planner-form">
            <div className="panel-label">YOUR REQUIREMENTS<span>_</span></div>
            <p className="planner-help">Every criterion you enter is treated as required. Leave a field empty to ignore it.</p>
            <div className="planner-field-grid">
              <NumberInput label="Your GPA (out of 4.0)" description="Schools without a listed minimum remain eligible." min={0} max={4} step={0.1} decimalScale={2}
                value={preferences.studentGpa ?? ''} onChange={(value) => updatePreference('studentGpa', typeof value === 'number' ? value : null)} placeholder="e.g. 3.2" />
              <NumberInput label="Maximum extra cost (€)" description="Only schools at or below this amount are shown." min={0} thousandSeparator=" "
                value={preferences.maxExtraCharge ?? ''} onChange={(value) => updatePreference('maxExtraCharge', typeof value === 'number' ? value : null)} placeholder="No limit" />
              <div className="planner-field planner-full-field"><span className="planner-field-label">Required study areas</span>
                <p className="planner-field-description">The university must offer every selected study area.</p>
                <MultiFilter placeholder="Choose study areas" options={[...new Set(schools.flatMap((school) => school.specializations))].sort()} value={preferences.specializations}
                  onChange={(value) => updatePreference('specializations', value)} /></div>
              <div className="planner-field planner-full-field"><span className="planner-field-label">Study period</span>
                <MultiFilter placeholder="Any duration" options={[...new Set(schools.map((school) => school.semester).filter(Boolean))].sort()} value={preferences.semesters}
                  onChange={(value) => updatePreference('semesters', value)} searchable={false} /></div>
              <div className="planner-field planner-full-field"><span className="planner-field-label">Instruction language</span>
                <MultiFilter placeholder="Any language" options={languages} value={preferences.languages} onChange={(value) => updatePreference('languages', value)} searchable={false} /></div>
            </div>
            <Button variant="subtle" size="xs" color="gray" onClick={() => onPreferencesChange(DEFAULT_PREFERENCES)}>Reset criteria</Button>
          </section>
          <section className="planner-results">
            <div className="planner-results-heading"><div><div className="panel-label">STRICT COMPATIBILITY<span>_</span></div><h3 aria-live="polite">{matches.length} matching {matches.length === 1 ? 'destination' : 'destinations'}</h3></div>
              <span className="planner-result-total">OF {schools.length}</span></div>
            {matches.length ? <><div className="planner-match-list">{visibleMatches.map(({ school, matchedCriteria }) => <article className="planner-match" key={school.id}>
              <div><span className="planner-match-country">{school.country}</span><h4>{school.name}</h4><p>{school.specializations.slice(0, 3).join(' · ') || 'No study areas listed'}</p>
                <div className="planner-match-reasons">{matchedCriteria.map((reason) => <span key={reason}><IconCheck size={12} />{reason}</span>)}</div></div>
              <Button variant="subtle" size="xs" onClick={() => openChecklist(school.id)}>Plan <IconArrowRight size={13} /></Button>
            </article>)}</div>{matchPageCount > 1 && <div className="planner-pagination"><span>SHOWING {(matchPage - 1) * matchPageSize + 1}–{Math.min(matchPage * matchPageSize, matches.length)} OF {matches.length}</span>
              <Pagination total={matchPageCount} value={matchPage} onChange={setMatchPage} size="sm" withControls /></div>}</> : <div className="empty-results planner-empty"><h3>No schools match all your requirements</h3>
              <p>Remove one of the required criteria or reset the form to see more destinations.</p><Button size="xs" variant="default" onClick={() => onPreferencesChange(DEFAULT_PREFERENCES)}>Reset criteria</Button></div>}
          </section>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="checklist" pt="md">
        <section className="panel checklist-panel">
          <div className="checklist-topline"><div><div className="panel-label">APPLICATION PLAN<span>_</span></div><h3>{selectedSchool?.name || 'Choose a partner school'}</h3>
            <p>Track your own tasks and deadlines. Changes are saved in this browser.</p></div>
            <select className="checklist-school-select" aria-label="Choose a partner school" value={selectedSchoolId || ''} onChange={(event) => openChecklist(Number(event.currentTarget.value))}>
              <option value="" disabled>Select a school…</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name} — {school.country}</option>)}
            </select>
          </div>
          {!selectedSchool ? <div className="checklist-empty"><IconCalendar size={21} /><span>Select a university to start its checklist.</span></div> : <>
            <div className="checklist-progress"><span>{(checklists[selectedSchoolId] || []).filter((task) => task.completed).length} OF {(checklists[selectedSchoolId] || []).length} TASKS COMPLETE</span>
              <div><i style={{ width: `${(checklists[selectedSchoolId] || []).length ? (100 * (checklists[selectedSchoolId] || []).filter((task) => task.completed).length / (checklists[selectedSchoolId] || []).length) : 0}%` }} /></div></div>
            <div className="checklist-tasks">{(checklists[selectedSchoolId] || []).map((task) => <div className={'checklist-task' + (task.completed ? ' is-complete' : '')} key={task.id}>
              <Checkbox checked={task.completed} onChange={(event) => updateChecklist((checklists[selectedSchoolId] || []).map((entry) => entry.id === task.id ? { ...entry, completed: event.currentTarget.checked } : entry))}
                aria-label={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`} />
              <TextInput aria-label="Task name" value={task.title} onChange={(event) => updateChecklist((checklists[selectedSchoolId] || []).map((entry) => entry.id === task.id ? { ...entry, title: event.currentTarget.value } : entry))} />
              <input className="checklist-date" type="date" aria-label={`Deadline for ${task.title}`} value={task.dueDate}
                onChange={(event) => updateChecklist((checklists[selectedSchoolId] || []).map((entry) => entry.id === task.id ? { ...entry, dueDate: event.currentTarget.value } : entry))} />
              <Button variant="subtle" color="gray" size="compact-xs" aria-label={`Remove ${task.title}`} onClick={() => updateChecklist((checklists[selectedSchoolId] || []).filter((entry) => entry.id !== task.id))}><IconTrash size={15} /></Button>
            </div>)}</div>
            <div className="checklist-actions"><Button variant="default" size="xs" leftSection={<IconPlus size={14} />} onClick={() => updateChecklist([...(checklists[selectedSchoolId] || []), { id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`, title: '', dueDate: '', completed: false }])}>Add a task</Button>
              <Button variant="subtle" size="xs" color="gray" onClick={() => updateChecklist(defaultChecklist())}>Restore template</Button></div>
          </>}
        </section>
      </Tabs.Panel>
    </Tabs>
  </section>;
}
