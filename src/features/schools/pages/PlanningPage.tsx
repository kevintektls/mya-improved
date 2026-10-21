import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Checkbox, NumberInput, Pagination, Tabs, TextInput } from '@mantine/core';
import { IconArrowRight, IconCalendar, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { MultiFilter } from '../../../components/schools/MultiFilter';
import { DEFAULT_PREFERENCES, defaultChecklist } from '../data/studentWorkspace';
import { matchSchools } from '../utils/schoolMatching';
import type { ChecklistTask, PlanningPreferences, SchoolRecord } from '../types';
import { translatedData, translatedSchoolName, useLanguage } from '../i18n';

interface PlanningPageProps {
  schools: SchoolRecord[];
  preferences: PlanningPreferences;
  onPreferencesChange: (preferences: PlanningPreferences) => void;
  checklists: Record<number, ChecklistTask[]>;
  onChecklistChange: (schoolId: number, tasks: ChecklistTask[]) => void;
}

export function PlanningPage({ schools, preferences, onPreferencesChange, checklists, onChecklistChange }: PlanningPageProps) {
  const { language, t } = useLanguage();
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
    <div className="section-heading"><div><div className="eyebrow">{t('MY JOURNEY')} <span>/</span> {t('DESTINATION PLANNER')}</div>
      <h2>{t('PLAN YOUR EXCHANGE')}<span className="title-caret">_</span></h2>
      <p className="section-deck">{t('Find partner schools that match your requirements and keep your next steps in one place.')}</p></div>
    </div>
    <Tabs value={activeTab} onChange={(value) => {
      const next = new URLSearchParams(params);
      next.set('tab', value || 'matches');
      setParams(next);
    }} className="planning-tabs">
      <Tabs.List><Tabs.Tab value="matches" leftSection={<IconArrowRight size={15} />}>{t('Find my destinations')}</Tabs.Tab>
        <Tabs.Tab value="checklist" leftSection={<IconCalendar size={15} />}>{t('Application checklist')}</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="matches" pt="md">
        <div className="planner-layout">
          <section className="panel planner-form">
            <div className="panel-label">{t('YOUR REQUIREMENTS')}<span>_</span></div>
            <p className="planner-help">{t('Every criterion you enter is treated as required. Leave a field empty to ignore it.')}</p>
            <div className="planner-field-grid">
              <NumberInput label={t('Your GPA (out of 4.0)')} description={t('Schools without a listed minimum remain eligible.')} min={0} max={4} step={0.1} decimalScale={2}
                value={preferences.studentGpa ?? ''} onChange={(value) => updatePreference('studentGpa', typeof value === 'number' ? value : null)} placeholder={language === 'fr' ? 'ex. 3,2' : 'e.g. 3.2'} />
              <NumberInput label={t('Maximum extra cost (€)')} description={t('Only schools at or below this amount are shown.')} min={0} thousandSeparator=" "
                value={preferences.maxExtraCharge ?? ''} onChange={(value) => updatePreference('maxExtraCharge', typeof value === 'number' ? value : null)} placeholder={t('No limit')} />
              <div className="planner-field planner-full-field"><span className="planner-field-label">{t('Required study areas')}</span>
                <p className="planner-field-description">{t('The university must offer every selected study area.')}</p>
                <MultiFilter placeholder={t('Choose study areas')} options={[...new Set(schools.flatMap((school) => school.specializations))].sort()} value={preferences.specializations}
                  onChange={(value) => updatePreference('specializations', value)} /></div>
              <div className="planner-field planner-full-field"><span className="planner-field-label">{t('Study period')}</span>
                <MultiFilter placeholder={t('Any duration')} options={[...new Set(schools.map((school) => school.semester).filter(Boolean))].sort()} value={preferences.semesters}
                  onChange={(value) => updatePreference('semesters', value)} searchable={false} /></div>
              <div className="planner-field planner-full-field"><span className="planner-field-label">{t('Instruction language')}</span>
                <MultiFilter placeholder={t('Any language')} options={languages} value={preferences.languages} onChange={(value) => updatePreference('languages', value)} searchable={false} /></div>
            </div>
            <Button variant="subtle" size="xs" color="gray" onClick={() => onPreferencesChange(DEFAULT_PREFERENCES)}>{t('Reset criteria')}</Button>
          </section>
          <section className="planner-results">
            <div className="planner-results-heading"><div><div className="panel-label">{t('STRICT COMPATIBILITY')}<span>_</span></div><h3 aria-live="polite">{language === 'fr' ? `${matches.length} destination${matches.length > 1 ? 's' : ''} compatible${matches.length > 1 ? 's' : ''}` : `${matches.length} matching ${matches.length === 1 ? 'destination' : 'destinations'}`}</h3></div>
              <span className="planner-result-total">{language === 'fr' ? 'SUR' : 'OF'} {schools.length}</span></div>
            {matches.length ? <><div className="planner-match-list">{visibleMatches.map(({ school, matchedCriteria }) => <article className="planner-match" key={school.id}>
              <div><span className="planner-match-country">{translatedData(school.country, 'countries', language)}</span><h4>{translatedSchoolName(school.name, school.nameFr, language)}</h4><p>{school.specializations.slice(0, 3).map((area) => translatedData(area, 'specializations', language)).join(' · ') || t('No study areas listed')}</p>
                <div className="planner-match-reasons">{matchedCriteria.map((reason) => <span key={reason}><IconCheck size={12} />{t(reason)}</span>)}</div></div>
              <Button variant="subtle" size="xs" onClick={() => openChecklist(school.id)}>{t('Plan')} <IconArrowRight size={13} /></Button>
            </article>)}</div>{matchPageCount > 1 && <div className="planner-pagination"><span>{language === 'fr' ? `AFFICHAGE ${(matchPage - 1) * matchPageSize + 1}–${Math.min(matchPage * matchPageSize, matches.length)} SUR ${matches.length} UNIVERSITÉS` : `SHOWING ${(matchPage - 1) * matchPageSize + 1}–${Math.min(matchPage * matchPageSize, matches.length)} OF ${matches.length} SCHOOLS`}</span>
              <Pagination total={matchPageCount} value={matchPage} onChange={setMatchPage} size="sm" withControls /></div>}</> : <div className="empty-results planner-empty"><h3>{t('No schools match all your requirements')}</h3>
              <p>{t('Remove one of the required criteria or reset the form to see more destinations.')}</p><Button size="xs" variant="default" onClick={() => onPreferencesChange(DEFAULT_PREFERENCES)}>{t('Reset criteria')}</Button></div>}
          </section>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="checklist" pt="md">
        <section className="panel checklist-panel">
          <div className="checklist-topline"><div><div className="panel-label">{t('APPLICATION PLAN')}<span>_</span></div><h3>{selectedSchool?.name || t('Choose a partner school')}</h3>
            <p>{t('Track your own tasks and deadlines. Changes are saved in this browser.')}</p></div>
            <select className="checklist-school-select" aria-label={t('Choose a partner school')} value={selectedSchoolId || ''} onChange={(event) => openChecklist(Number(event.currentTarget.value))}>
              <option value="" disabled>{t('Select a school…')}</option>{schools.map((school) => <option key={school.id} value={school.id}>{translatedSchoolName(school.name, school.nameFr, language)} — {translatedData(school.country, 'countries', language)}</option>)}
            </select>
          </div>
          {!selectedSchool ? <div className="checklist-empty"><IconCalendar size={21} /><span>{t('Select a university to start its checklist.')}</span></div> : <>
            <div className="checklist-progress"><span>{(checklists[selectedSchoolId] || []).filter((task) => task.completed).length} {language === 'fr' ? 'SUR' : 'OF'} {(checklists[selectedSchoolId] || []).length} {t('TASKS COMPLETE')}</span>
              <div><i style={{ width: `${(checklists[selectedSchoolId] || []).length ? (100 * (checklists[selectedSchoolId] || []).filter((task) => task.completed).length / (checklists[selectedSchoolId] || []).length) : 0}%` }} /></div></div>
            <div className="checklist-tasks">{(checklists[selectedSchoolId] || []).map((task) => <div className={'checklist-task' + (task.completed ? ' is-complete' : '')} key={task.id}>
              <Checkbox checked={task.completed} onChange={(event) => updateChecklist((checklists[selectedSchoolId] || []).map((entry) => entry.id === task.id ? { ...entry, completed: event.currentTarget.checked } : entry))}
                aria-label={`${language === 'fr' ? 'Marquer comme' : 'Mark'} ${t(task.title)} ${task.completed ? t('incomplete') : t('complete')}`} />
              <TextInput aria-label={t('Task name')} value={task.title} onChange={(event) => updateChecklist((checklists[selectedSchoolId] || []).map((entry) => entry.id === task.id ? { ...entry, title: event.currentTarget.value } : entry))} />
              <input className="checklist-date" type="date" aria-label={`${t('Deadline for')} ${task.title}`} value={task.dueDate}
                onChange={(event) => updateChecklist((checklists[selectedSchoolId] || []).map((entry) => entry.id === task.id ? { ...entry, dueDate: event.currentTarget.value } : entry))} />
              <Button variant="subtle" color="gray" size="compact-xs" aria-label={`${t('Remove')} ${t(task.title)}`} onClick={() => updateChecklist((checklists[selectedSchoolId] || []).filter((entry) => entry.id !== task.id))}><IconTrash size={15} /></Button>
            </div>)}</div>
            <div className="checklist-actions"><Button variant="default" size="xs" leftSection={<IconPlus size={14} />} onClick={() => updateChecklist([...(checklists[selectedSchoolId] || []), { id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`, title: '', dueDate: '', completed: false }])}>{t('Add a task')}</Button>
              <Button variant="subtle" size="xs" color="gray" onClick={() => updateChecklist(defaultChecklist())}>{t('Restore template')}</Button></div>
          </>}
        </section>
      </Tabs.Panel>
    </Tabs>
  </section>;
}
