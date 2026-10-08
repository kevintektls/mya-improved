import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon, Burger, Button, Divider, Drawer, Modal, NavLink, Popover, Text, TextInput } from '@mantine/core';
import {
  IconBookmark, IconBuildingCommunity, IconCalendar, IconChevronRight, IconFileText, IconGitCompare,
  IconMapPin, IconSearch, IconSparkles, IconWorld, IconX,
} from '@tabler/icons-react';
import { ComparisonTray } from '../components/schools/ComparisonTray';
import { StudentSummary } from '../components/schools/StudentSummary';
import { EpitechLoader } from '../components/ui/EpitechLoader';
import { fetchSchools } from '../features/schools/data/schools';
import { readStudentWorkspace, writeStudentWorkspace } from '../features/schools/data/studentWorkspace';
import { CountriesPage, SpecializationsPage } from '../features/schools/pages/DiscoveryPages';
import { PlanningPage } from '../features/schools/pages/PlanningPage';
import { SchoolComparePage } from '../features/schools/pages/SchoolComparePage';
import { SchoolDirectory } from '../features/schools/pages/SchoolDirectoryPage';
import { SchoolDetail } from '../features/schools/pages/SchoolDetailPage';
import type { ChecklistTask, FavoriteDetails, SchoolRecord, StudentWorkspace } from '../features/schools/types';

const sideGroups = [
  { title: '< OVERVIEW />', links: [
    { label: 'Partner schools', path: '/schools', icon: IconWorld },
    { label: 'Countries', path: '/countries', icon: IconMapPin },
    { label: 'Specializations', path: '/specializations', icon: IconSparkles },
    { label: 'Compare schools', path: '/compare', icon: IconGitCompare },
  ] },
  { title: '< MY JOURNEY />', links: [
    { label: 'Saved schools', path: '/schools?view=saved', icon: IconBookmark },
    { label: 'Planning', path: '/planning', icon: IconCalendar },
  ] },
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpened, mobileNav] = useDisclosure(false);
  const [workspace, setWorkspace] = useState<StudentWorkspace>(readStudentWorkspace);
  const saved = workspace.savedSchoolIds;
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [searchOpened, setSearchOpened] = useState(false);
  const [query, setQuery] = useState('');
  const [noticeOpened, notice] = useDisclosure(false);

  useEffect(() => {
    const startedAt = performance.now();
    let cancelled = false;
    let hideLoaderTimeout = 0;
    fetchSchools()
      .then((result) => { if (!cancelled) setSchools(result); })
      .catch((error: unknown) => { if (!cancelled) setDataError(error instanceof Error ? error.message : 'Could not load school data.'); })
      .finally(() => {
        const remaining = Math.max(0, 320 - (performance.now() - startedAt));
        hideLoaderTimeout = window.setTimeout(() => { if (!cancelled) setDataLoading(false); }, remaining);
      });
    return () => { cancelled = true; window.clearTimeout(hideLoaderTimeout); };
  }, []);

  const countries = useMemo(() => [...new Set(schools.map((school) => school.country))].sort((a, b) => a.localeCompare(b)), [schools]);
  const specializations = useMemo(() => [...new Set(schools.flatMap((school) => school.specializations || []))].sort((a, b) => a.localeCompare(b)), [schools]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpened(true);
      }
      if (event.key === 'Escape') setSearchOpened(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => writeStudentWorkspace(workspace), [workspace]);

  const toggleSaved = (id: number) => setWorkspace((current) => ({
    ...current,
    savedSchoolIds: current.savedSchoolIds.includes(id) ? current.savedSchoolIds.filter((savedId) => savedId !== id) : [...current.savedSchoolIds, id],
  }));
  const toggleCompared = (id: number) => setWorkspace((current) => {
    if (current.comparedSchoolIds.includes(id)) return { ...current, comparedSchoolIds: current.comparedSchoolIds.filter((schoolId) => schoolId !== id) };
    if (current.comparedSchoolIds.length >= 4) return current;
    return { ...current, comparedSchoolIds: [...current.comparedSchoolIds, id] };
  });
  const updateFavoriteDetails = (id: number, details: FavoriteDetails) => setWorkspace((current) => ({
    ...current, favoriteDetails: { ...current.favoriteDetails, [id]: details },
  }));
  const updatePreferences = (preferences: StudentWorkspace['preferences']) => setWorkspace((current) => ({ ...current, preferences }));
  const updateChecklist = (id: number, tasks: ChecklistTask[]) => setWorkspace((current) => ({
    ...current, checklists: { ...current.checklists, [id]: tasks },
  }));
  const clearCompared = () => setWorkspace((current) => ({ ...current, comparedSchoolIds: [] }));
  const comparedSchools = workspace.comparedSchoolIds.flatMap((id) => {
    const school = schools.find((item) => item.id === id);
    return school ? [school] : [];
  });
  const go = (path: string) => { navigate(path); mobileNav.close(); setSearchOpened(false); setQuery(''); };

  const sidebar = <div className="sidebar-inner">
    {sideGroups.map((group) => <section className="nav-group" key={group.title}>
      <div className="nav-caption">{group.title}</div>
      {group.links.map((item) => {
        const Icon = item.icon;
        const active = item.path.includes('?')
          ? location.pathname + location.search === item.path
          : (location.pathname === item.path && !(item.path === '/schools' && location.search.includes('view=saved'))) ||
            (item.path === '/schools' && location.pathname.startsWith('/schools/'));
        return <NavLink key={item.path} className="side-link" active={active} label={item.label}
          leftSection={<Icon size={15} stroke={1.8} />} onClick={() => go(item.path)} />;
      })}
    </section>)}
    <div className="sidebar-foot"><div className="sidebar-foot-mark"><span>MYA</span><span>INTERNATIONAL</span></div>
      <span className="sidebar-version">PARTNER NETWORK · {schools.length || '—'} SCHOOLS</span></div>
  </div>;

  return <div className="app-frame catalog-frame">
    <header className="topbar">
      <div className="brand">
        <Burger opened={mobileNavOpened} onClick={mobileNav.toggle} hiddenFrom="sm" size="sm" aria-label="Open navigation" />
        <button className="brand-wordmark" onClick={() => go('/schools')} aria-label="Epitech home">
          <span className="brand-brace">{'{'}</span>EPITECH<span className="brand-brace">{'}'}</span>
        </button>
      </div>
      <button className="search-trigger" onClick={() => setSearchOpened(true)}>
        <IconSearch size={16} stroke={1.8} /><span>Find a school or destination…</span><kbd>CTRL + K</kbd>
      </button>
      <div className="top-actions">
        <Popover opened={noticeOpened} onChange={(opened) => opened ? notice.open() : notice.close()} position="bottom-end" shadow="md" width={290}>
          <Popover.Target><ActionIcon variant="subtle" color="white" className="top-icon" aria-label="Notifications" onClick={notice.toggle}>
            <IconFileText size={18} stroke={1.8} /><i className="notification-dot" />
          </ActionIcon></Popover.Target>
          <Popover.Dropdown className="popover-panel"><Text fw={700} size="sm">Partner network</Text><Divider my="sm" />
            <Text size="sm">Browse {schools.length} partner school profiles.</Text>
            <Text size="xs" c="dimmed" mt={6}>Data source · MYA Epitech</Text>
          </Popover.Dropdown>
        </Popover>
      </div>
    </header>

    <div className="app-body">
      <aside className="sidebar">{sidebar}</aside>
      <Drawer opened={mobileNavOpened} onClose={mobileNav.close} title={<span className="drawer-title">EPITECH · MENU</span>}
        size={280} padding={0} hiddenFrom="sm" classNames={{ content: 'mobile-drawer', header: 'mobile-drawer-header', body: 'mobile-drawer-body' }}>
        {sidebar}
      </Drawer>
      <main className="main-content">
        <StudentSummary schoolCount={schools.length} countryCount={countries.length} areaCount={specializations.length} />
        <div className="catalog-tabs" role="navigation" aria-label="School directory">
          <button className={location.pathname === '/schools' && !location.search.includes('view=saved') ? 'active' : ''} onClick={() => go('/schools')}>
            <IconWorld size={15} /> All schools <span>{schools.length}</span>
          </button>
          <button className={location.search.includes('view=saved') ? 'active' : ''} onClick={() => go('/schools?view=saved')}>
            <IconBookmark size={15} /> Saved <span>{saved.length}</span>
          </button>
          <button className={location.pathname === '/compare' ? 'active' : ''} onClick={() => go('/compare')}>
            <IconGitCompare size={15} /> Compare <span>{workspace.comparedSchoolIds.length}</span>
          </button>
          <span className="catalog-tabs-note">GLOBAL MOBILITY · 2026/27</span>
        </div>
        {dataLoading ? <EpitechLoader label="Loading partner schools" overlay /> : dataError ?
          <div className="catalog-load-error"><strong>School directory unavailable</strong><span>{dataError}</span><Button size="xs" variant="default" onClick={() => window.location.reload()}>Retry</Button></div> :
          <Routes>
            <Route path="/" element={<Navigate to="/schools" replace />} />
            <Route path="/schools" element={<SchoolDirectory schools={schools} countries={countries} specializations={specializations} saved={saved} toggleSaved={toggleSaved}
              compared={workspace.comparedSchoolIds} toggleCompared={toggleCompared} favoriteDetails={workspace.favoriteDetails} updateFavoriteDetails={updateFavoriteDetails} />} />
            <Route path="/schools/:id" element={<SchoolDetail schools={schools} saved={saved} toggleSaved={toggleSaved} compared={workspace.comparedSchoolIds} toggleCompared={toggleCompared} />} />
            <Route path="/compare" element={<SchoolComparePage schools={comparedSchools} onRemove={toggleCompared} onClear={clearCompared} />} />
            <Route path="/countries" element={<CountriesPage schools={schools} countries={countries} />} />
            <Route path="/specializations" element={<SpecializationsPage schools={schools} specializations={specializations} />} />
            <Route path="/planning" element={<PlanningPage schools={schools} preferences={workspace.preferences} onPreferencesChange={updatePreferences}
              checklists={workspace.checklists} onChecklistChange={updateChecklist} />} />
            <Route path="*" element={<Navigate to="/schools" replace />} />
          </Routes>}
        {!dataLoading && !dataError && <ComparisonTray schools={comparedSchools} onRemove={toggleCompared} onClear={clearCompared} />}
      </main>
    </div>

    <Modal opened={searchOpened} onClose={() => setSearchOpened(false)} title={<div className="search-modal-title"><IconSearch size={17} /> Find a partner school</div>}
      centered size="md" classNames={{ content: 'search-modal', header: 'search-modal-header', body: 'search-modal-body' }}>
      <TextInput autoFocus leftSection={<IconSearch size={16} />} placeholder="Type a school, country or specialization…" value={query}
        onChange={(event) => setQuery(event.currentTarget.value)} rightSection={<ActionIcon variant="subtle" aria-label="Clear search" onClick={() => setQuery('')}><IconX size={15} /></ActionIcon>} />
      <div className="command-results">
        {schools.filter((school) => (school.name + ' ' + school.country + ' ' + school.specializations.join(' ')).toLowerCase().includes(query.toLowerCase())).slice(0, 7).map((school) =>
          <button className="command-result" key={school.id} onClick={() => go('/schools/' + school.id)}>
            <IconBuildingCommunity size={16} /><span>{school.name}</span><small>{school.country}</small><IconChevronRight size={15} />
          </button>)}
        {query && !schools.some((school) => (school.name + ' ' + school.country + ' ' + school.specializations.join(' ')).toLowerCase().includes(query.toLowerCase())) &&
          <div className="command-empty">No partner schools match “{query}”.</div>}
      </div>
      <div className="command-hint"><span>Searches names, countries and study areas</span><kbd>ESC</kbd></div>
    </Modal>
  </div>;
}
