import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import {
  ActionIcon, Avatar, Badge, Burger, Button, Checkbox, Divider, Drawer, Modal, NavLink,
  Pagination, Popover, Select, Tabs, Text, TextInput, Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft, IconArrowRight, IconBook2, IconBookmark, IconBuildingCommunity,
  IconCalendar, IconCheck, IconChevronDown, IconChevronRight, IconCurrencyEuro,
  IconFileText, IconFilter, IconHeart, IconLanguage, IconMapPin, IconSearch,
  IconSparkles, IconUsers, IconWorld, IconX,
} from '@tabler/icons-react';

const normalizeSchools = (list) => list.map((school) => ({
  ...school,
  name: school.name.trim(),
  images: (school.images?.length ? school.images : [school.image1, school.image2, school.image3]
    .filter(Boolean).map((image) => 'https://mya.epitech.eu/uploads/' + image)),
}));
const studyOptions = [
  { value: 'Full-year only', label: 'Full year' },
  { value: 'Semester only', label: 'Semester' },
  { value: 'Full-year or semester', label: 'Flexible duration' },
];
const detailSections = [
  { key: 'overview', label: 'Overview', icon: IconWorld },
  { key: 'administrative', label: 'Application & admin', icon: IconFileText },
  { key: 'accomodation', label: 'Accommodation', icon: IconBuildingCommunity },
  { key: 'courses', label: 'Courses', icon: IconBook2 },
  { key: 'cost', label: 'Cost of living', icon: IconCurrencyEuro },
];

function readSaved() {
  try { return JSON.parse(localStorage.getItem('mya-saved-schools') || '[]'); }
  catch { return []; }
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpened, mobileNav] = useDisclosure(false);
  const [saved, setSaved] = useState(readSaved);
  const [schools, setSchools] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [searchOpened, setSearchOpened] = useState(false);
  const [query, setQuery] = useState('');
  const [noticeOpened, notice] = useDisclosure(false);

  useEffect(() => {
    fetch('/data/mya-epitech-universities.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load the school directory.');
        return response.json();
      })
      .then((data) => setSchools(normalizeSchools(data.schools || [])))
      .catch((error) => setDataError(error.message || 'Could not load school data.'))
      .finally(() => setDataLoading(false));
  }, []);

  const countries = useMemo(() => [...new Set(schools.map((school) => school.country))].sort((a, b) => a.localeCompare(b)), [schools]);
  const specializations = useMemo(() => [...new Set(schools.flatMap((school) => school.specializations || []))].sort((a, b) => a.localeCompare(b)), [schools]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpened(true);
      }
      if (event.key === 'Escape') setSearchOpened(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => localStorage.setItem('mya-saved-schools', JSON.stringify(saved)), [saved]);

  const toggleSaved = (id) => setSaved((current) => current.includes(id)
    ? current.filter((savedId) => savedId !== id) : [...current, id]);
  const go = (path) => { navigate(path); mobileNav.close(); setSearchOpened(false); setQuery(''); };
  const sideGroups = [
    { title: '< OVERVIEW />', links: [
      { label: 'Partner schools', path: '/schools', icon: IconWorld },
      { label: 'Countries', path: '/countries', icon: IconMapPin },
      { label: 'Specializations', path: '/specializations', icon: IconSparkles },
    ] },
    { title: '< MY JOURNEY />', links: [
      { label: 'Saved schools', path: '/schools?view=saved', icon: IconBookmark },
      { label: 'Planning', path: '/planning', icon: IconCalendar },
      { label: 'Academic details', path: '/academic/required-exams', icon: IconFileText },
    ] },
  ];

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
            <Text size="sm">Browse {schools.length} active partner school profiles.</Text>
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
          <span className="catalog-tabs-note">GLOBAL MOBILITY · 2026/27</span>
        </div>
        {dataLoading ? <div className="catalog-loading"><span className="loading-mark" /> Loading partner schools…</div> : dataError ?
          <div className="catalog-load-error"><strong>School directory unavailable</strong><span>{dataError}</span><Button size="xs" variant="default" onClick={() => window.location.reload()}>Retry</Button></div> :
          <Routes>
            <Route path="/" element={<Navigate to="/schools" replace />} />
            <Route path="/schools" element={<SchoolDirectory schools={schools} countries={countries} specializations={specializations} saved={saved} toggleSaved={toggleSaved} />} />
            <Route path="/schools/:id" element={<SchoolDetail schools={schools} saved={saved} toggleSaved={toggleSaved} />} />
            <Route path="/countries" element={<CountriesPage schools={schools} countries={countries} />} />
            <Route path="/specializations" element={<SpecializationsPage schools={schools} specializations={specializations} />} />
            <Route path="/academic/*" element={<InfoPage title="Academic details" copy="Academic records and exam results remain available in your student space." />} />
            <Route path="/planning" element={<InfoPage title="Planning" copy="Your mobility planning workspace is ready for your shortlist and application dates." />} />
            <Route path="*" element={<Navigate to="/schools" replace />} />
          </Routes>}
      </main>
    </div>

    <Modal opened={searchOpened} onClose={() => setSearchOpened(false)} title={<div className="search-modal-title"><IconSearch size={17} /> Find a partner school</div>}
      centered size="md" classNames={{ content: 'search-modal', header: 'search-modal-header', body: 'search-modal-body' }}>
      <TextInput autoFocus leftSection={<IconSearch size={16} />} placeholder="Type a school, country or specialization…" value={query}
        onChange={(event) => setQuery(event.currentTarget.value)} rightSection={<ActionIcon variant="subtle" aria-label="Clear search" onClick={() => setQuery('')}><IconX size={15} /></ActionIcon>} />
      <div className="command-results">
        {schools.filter((school) => (school.name + ' ' + school.country + ' ' + (school.specializations || []).join(' ')).toLowerCase().includes(query.toLowerCase())).slice(0, 7).map((school) =>
          <button className="command-result" key={school.id} onClick={() => go('/schools/' + school.id)}>
            <IconBuildingCommunity size={16} /><span>{school.name}</span><small>{school.country}</small><IconChevronRight size={15} />
          </button>)}
        {query && !schools.some((school) => (school.name + ' ' + school.country + ' ' + (school.specializations || []).join(' ')).toLowerCase().includes(query.toLowerCase())) &&
          <div className="command-empty">No partner schools match “{query}”.</div>}
      </div>
      <div className="command-hint"><span>Searches names, countries and study areas</span><kbd>ESC</kbd></div>
    </Modal>
  </div>;
}

function StudentSummary({ schoolCount, countryCount, areaCount }) {
  return <section className="student-card catalog-summary">
    <div className="student-identity"><Avatar size={62} radius={6} color="dark" className="student-avatar"><IconWorld size={23} /></Avatar>
      <div className="student-info"><div className="student-heading-row"><h1>GLOBAL OPPORTUNITIES</h1></div>
        <div className="student-name-line"><strong>International exchange</strong><span>Explore your study options</span></div>
      </div>
    </div>
    <div className="student-metrics catalog-metrics">
      <div className="student-metric"><span>PARTNER SCHOOLS</span><strong>{schoolCount}</strong></div>
      <div className="student-metric credits"><span>COUNTRIES</span><strong>{countryCount}</strong></div>
      <div className="student-metric"><span>STUDY AREAS</span><strong>{areaCount}</strong></div>
    </div>
  </section>;
}

function SchoolDirectory({ schools, countries, specializations, saved, toggleSaved }) {
  const [params, setParams] = useSearchParams();
  const savedOnly = params.get('view') === 'saved';
  const [search, setSearch] = useState('');
  const [schoolIds, setSchoolIds] = useState([]);
  const [country, setCountry] = useState(params.getAll('country'));
  const [specialization, setSpecialization] = useState(params.getAll('specialization'));
  const [strictStudyAreas, setStrictStudyAreas] = useState(false);
  const [semester, setSemester] = useState([]);
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const schoolOptions = useMemo(() => schools.map((school) => ({ value: String(school.id), label: school.name })), [schools]);

  useEffect(() => {
    setCountry(params.getAll('country'));
    setSpecialization(params.getAll('specialization'));
  }, [params]);
  const updateParamValues = (key, values) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    values.forEach((value) => next.append(key, value));
    setParams(next);
  };
  const filtered = useMemo(() => schools.filter((school) => {
    const text = (school.name + ' ' + school.country + ' ' + (school.specializations || []).join(' ')).toLowerCase();
    return (!savedOnly || saved.includes(school.id)) &&
      (!schoolIds.length || schoolIds.includes(String(school.id))) &&
      (!search || text.includes(search.toLowerCase())) &&
      (!country.length || country.includes(school.country)) &&
      (!specialization.length || (strictStudyAreas
        ? specialization.every((area) => school.specializations?.includes(area))
        : specialization.some((area) => school.specializations?.includes(area)))) &&
      (!semester.length || semester.includes(school.semester));
  }).sort((a, b) => sort === 'spots' ? b.spots - a.spots || a.name.localeCompare(b.name) : sort === 'cost' ? a.extracharge - b.extracharge || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)),
  [savedOnly, saved, schoolIds, search, country, specialization, strictStudyAreas, semester, sort]);

  useEffect(() => setPage(1), [savedOnly, schoolIds, search, country, specialization, strictStudyAreas, semester, sort]);
  const pageCount = Math.ceil(filtered.length / pageSize);
  const visibleSchools = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => { setSearch(''); setSchoolIds([]); setCountry([]); setSpecialization([]); setStrictStudyAreas(false); setSemester([]); setSort('name'); setParams(savedOnly ? { view: 'saved' } : {}); };
  const activeCount = country.length + specialization.length + semester.length + schoolIds.length + (search ? 1 : 0);

  return <section className="page-section school-directory">
    <div className="section-heading directory-heading">
      <div><div className="eyebrow">INTERNATIONAL MOBILITY <span>/</span> {savedOnly ? 'YOUR SHORTLIST' : 'PARTNER DIRECTORY'}</div>
        <h2>{savedOnly ? 'SAVED SCHOOLS' : country.length === 1 ? 'SCHOOLS IN ' + country[0].toUpperCase() : country.length > 1 ? 'SCHOOLS IN ' + country.length + ' COUNTRIES' : 'PARTNER SCHOOLS'}<span className="title-caret">_</span></h2>
        <p className="section-deck">Compare destinations, study options and application details for your exchange.</p>
      </div>
      <div className="directory-result-count"><strong>{filtered.length.toString().padStart(2, '0')}</strong><span>RESULTS</span></div>
    </div>

    <div className="filters-panel">
      <TextInput className="school-search" leftSection={<IconSearch size={16} />} placeholder="Search schools or destinations" value={search}
        onChange={(event) => setSearch(event.currentTarget.value)} aria-label="Search schools or destinations" />
      <MultiFilter placeholder="Partner schools" options={schoolOptions} value={schoolIds} onChange={setSchoolIds} />
      <MultiFilter placeholder="Countries" options={countries} value={country} onChange={(value) => { setCountry(value); updateParamValues('country', value); }} />
      <MultiFilter placeholder="Study areas" options={specializations} value={specialization}
        onChange={(value) => { setSpecialization(value); updateParamValues('specialization', value); }} badge={strictStudyAreas && specialization.length ? 'ALL' : null}
        headerAction={<Checkbox className="strict-study-checkbox" size="xs" color="epitech" label="Require all" checked={strictStudyAreas}
          onChange={(event) => setStrictStudyAreas(event.currentTarget.checked)} disabled={!specialization.length} aria-label="Require all selected study areas" />} />
      <MultiFilter placeholder="Duration" options={studyOptions} value={semester} onChange={setSemester} searchable={false} />
      <Select className="sort-select" data={[{ value: 'name', label: 'A–Z' }, { value: 'spots', label: 'Most places' }, { value: 'cost', label: 'Lowest extra cost' }]}
        value={sort} onChange={(value) => setSort(value || 'name')} aria-label="Sort schools" />
      {activeCount > 0 && <Button className="clear-filters" variant="subtle" size="xs" leftSection={<IconX size={13} />} onClick={clearFilters}>Clear ({activeCount})</Button>}
    </div>

    {filtered.length ? <>
      <div className="school-grid">{visibleSchools.map((school, index) =>
      <SchoolCard key={school.id} school={school} saved={saved.includes(school.id)} onToggleSaved={toggleSaved} index={index} />)}</div>
      {pageCount > 1 && <div className="directory-pagination">
        <span>SHOWING {((page - 1) * pageSize + 1).toString().padStart(2, '0')}–{Math.min(page * pageSize, filtered.length).toString().padStart(2, '0')} OF {filtered.length} SCHOOLS</span>
        <Pagination total={pageCount} value={page} onChange={setPage} size="sm" siblings={1} boundaries={1} withEdges aria-label="School directory pages" />
      </div>}
    </>
      : <div className="empty-results"><IconFilter size={25} /><h3>{savedOnly && saved.length === 0 ? 'Your shortlist is empty' : 'No schools found'}</h3>
        <p>{savedOnly && saved.length === 0 ? 'Save a partner school with the heart button to keep it here.' : 'Try a different search or clear one of your filters.'}</p>
        {activeCount > 0 && <Button variant="default" size="xs" onClick={clearFilters}>Clear filters</Button>}</div>}
  </section>;
}

function MultiFilter({ placeholder, options, value, onChange, searchable = true, badge, headerAction }) {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');
  const normalizedOptions = options.map((option) => typeof option === 'string' ? { value: option, label: option } : option);
  const selectedOptions = normalizedOptions.filter((option) => value.includes(option.value));
  const visibleOptions = normalizedOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  const buttonLabel = selectedOptions.length === 0 ? placeholder
    : selectedOptions.length === 1 ? selectedOptions[0].label
      : `${selectedOptions.length} selected`;
  const toggleOption = (optionValue) => onChange(value.includes(optionValue)
    ? value.filter((item) => item !== optionValue) : [...value, optionValue]);

  return <Popover opened={opened} onChange={setOpened} position="bottom-start" offset={4} shadow="md" width={280} withinPortal>
    <Popover.Target><button type="button" className="multi-filter-trigger" onClick={() => setOpened((current) => !current)}
      aria-label={`${placeholder}${selectedOptions.length ? `, ${selectedOptions.length} selected` : ''}`} aria-expanded={opened}>
      <span className={selectedOptions.length ? 'has-selection' : ''}>{buttonLabel}</span>
      {badge ? <small className="multi-filter-mode-badge">{badge}</small> : selectedOptions.length > 1 && <small>{selectedOptions.length}</small>}
      <IconChevronDown size={14} />
    </button></Popover.Target>
    <Popover.Dropdown className="multi-filter-dropdown">
      <div className="multi-filter-heading"><strong>{placeholder}</strong>{headerAction || <span>{selectedOptions.length ? `${selectedOptions.length} selected` : `${normalizedOptions.length} options`}</span>}</div>
      {searchable && <TextInput className="multi-filter-search" placeholder={`Search ${placeholder.toLowerCase()}`} value={query}
        onChange={(event) => setQuery(event.currentTarget.value)} aria-label={`Search ${placeholder}`} />}
      <div className="multi-filter-options">
        {visibleOptions.length ? visibleOptions.map((option) => {
          const selected = value.includes(option.value);
          return <button type="button" className={'multi-filter-option' + (selected ? ' selected' : '')} key={option.value}
            onClick={() => toggleOption(option.value)} aria-pressed={selected}>
            <span className="multi-filter-check">{selected && <IconCheck size={12} stroke={2.5} />}</span>
            <span>{option.label}</span>
          </button>;
        }) : <div className="multi-filter-empty">No matching options</div>}
      </div>
      <div className="multi-filter-footer">
        <button type="button" className="multi-filter-clear" onClick={() => onChange([])} disabled={!value.length}>Clear</button>
        <button type="button" className="multi-filter-done" onClick={() => setOpened(false)}>Done</button>
      </div>
    </Popover.Dropdown>
  </Popover>;
}

function SchoolCard({ school, saved, onToggleSaved, index }) {
  const navigate = useNavigate();
  const image = school.images?.[0];
  return <article className="school-card" style={{ '--card-index': index % 8 }}>
    <button className="school-image-button" onClick={() => navigate('/schools/' + school.id)} aria-label={'Open ' + school.name}>
      {image ? <img className="school-card-image" src={image} alt={school.name + ' campus'} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
      <span className="image-index">PARTNER / {String(school.id).padStart(3, '0')}</span>
      <span className="image-arrow"><IconArrowRight size={17} /></span>
    </button>
    <div className="school-card-body">
      <div className="school-country"><IconMapPin size={13} />{school.country}<span>{school.erasmus === 'YES' ? 'ERASMUS+' : 'PARTNER'}</span></div>
      <h3><button onClick={() => navigate('/schools/' + school.id)}>{school.name}</button></h3>
      <div className="school-tags">{(school.specializations || []).slice(0, 3).map((item) => <span key={item}>{item}</span>)}
        {(school.specializations || []).length > 3 && <span className="tag-more">+{school.specializations.length - 3}</span>}</div>
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

function SchoolDetail({ schools, saved, toggleSaved }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const school = schools.find((item) => String(item.id) === id);
  const [activeTab, setActiveTab] = useState('overview');
  const [failedImages, setFailedImages] = useState([]);

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
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')} variant="outline" className="detail-tabs">
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

function CountriesPage({ schools, countries }) {
  const navigate = useNavigate();
  const countByCountry = useMemo(() => Object.fromEntries(countries.map((country) => [country, schools.filter((school) => school.country === country).length])), [countries, schools]);
  return <section className="page-section discovery-page">
    <div className="section-heading"><div><div className="eyebrow">INTERNATIONAL MOBILITY <span>/</span> DESTINATIONS</div><h2>EXPLORE BY COUNTRY<span className="title-caret">_</span></h2>
      <p className="section-deck">Choose a destination to see its partner schools and exchange options.</p></div><div className="directory-result-count"><strong>{countries.length}</strong><span>COUNTRIES</span></div></div>
    <div className="country-grid">{countries.map((country, index) => <button className="country-card" key={country} onClick={() => navigate('/schools?country=' + encodeURIComponent(country))}>
      <span className="country-index">{String(index + 1).padStart(2, '0')}</span><span className="country-name">{country}</span>
      <span className="country-school-count">{countByCountry[country]} {countByCountry[country] === 1 ? 'SCHOOL' : 'SCHOOLS'}</span><IconArrowRight size={16} />
    </button>)}</div>
  </section>;
}

function SpecializationsPage({ schools, specializations }) {
  const navigate = useNavigate();
  const countBySpecialization = useMemo(() => Object.fromEntries(specializations.map((item) => [item, schools.filter((school) => school.specializations?.includes(item)).length])), [specializations, schools]);
  return <section className="page-section discovery-page">
    <div className="section-heading"><div><div className="eyebrow">INTERNATIONAL MOBILITY <span>/</span> STUDY AREAS</div><h2>FIND YOUR FIELD<span className="title-caret">_</span></h2>
      <p className="section-deck">Browse partner destinations by academic specialization.</p></div><div className="directory-result-count"><strong>{specializations.length}</strong><span>STUDY AREAS</span></div></div>
    <div className="specialization-grid">{specializations.map((item) => <button className="specialization-card" key={item} onClick={() => navigate('/schools?specialization=' + encodeURIComponent(item))}>
      <IconSparkles size={17} /><span>{item}</span><small>{countBySpecialization[item]} schools</small><IconArrowRight size={15} />
    </button>)}</div>
  </section>;
}

function InfoPage({ title, copy }) {
  return <section className="page-section discovery-page"><div className="section-heading"><div><div className="eyebrow">MY JOURNEY <span>/</span> STUDENT SPACE</div><h2>{title.toUpperCase()}<span className="title-caret">_</span></h2></div></div>
    <section className="panel info-panel"><IconFileText size={25} /><div><div className="panel-label">STUDENT WORKSPACE<span>_</span></div><h3>{title}</h3><p>{copy}</p></div></section>
  </section>;
}

const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'A', 'IMG', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'HR', 'SPAN', 'DIV']);
function sanitizeHtml(html) {
  if (typeof window === 'undefined' || !html) return '';
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script,style,iframe,object,embed,form,svg,math').forEach((node) => node.remove());
  const all = [...document.body.querySelectorAll('*')];
  all.reverse().forEach((element) => {
    if (!allowedTags.has(element.tagName)) { element.replaceWith(...element.childNodes); return; }
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const allowed = element.tagName === 'A' ? ['href', 'target', 'rel'].includes(name)
        : element.tagName === 'IMG' ? ['src', 'alt', 'title', 'width', 'height'].includes(name) : false;
      if (!allowed) element.removeAttribute(attribute.name);
    });
    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || '';
      if (!/^(https?:|mailto:)/i.test(href)) element.removeAttribute('href');
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
    }
    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src') || '';
      if (!/^(https?:\/\/|data:image\/(?:png|jpeg|gif|webp);base64,)/i.test(src)) {
        element.remove();
      } else {
        element.setAttribute('loading', 'lazy');
        element.setAttribute('decoding', 'async');
      }
    }
  });
  return document.body.innerHTML;
}

export default App;
