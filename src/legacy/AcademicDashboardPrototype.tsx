import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon, Avatar, Badge, Burger, Button, Divider, Drawer, Modal,
  NavLink, Popover, Progress, Table, Text, TextInput, Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconActivity, IconAdjustments, IconApps, IconBell, IconBook2, IconCalendar,
  IconCertificate, IconChevronDown, IconChevronRight, IconClock, IconCommand,
  IconDeviceLaptop, IconFileText, IconFlag, IconGauge, IconLayoutDashboard,
  IconNotebook, IconPuzzle, IconSearch, IconSparkles, IconTarget, IconUser,
  IconX,
} from '@tabler/icons-react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const examRows = [
  { date: '18/09/2026', score: 685, state: 'INSUFFICIENT' },
  { date: '16/09/2026', score: 410, state: 'INSUFFICIENT' },
];

const topTabs = [
  { label: 'Overview', path: '/academic/overview', icon: IconLayoutDashboard },
  { label: 'Competencies', path: '/academic/competencies', icon: IconCertificate },
  { label: 'Evaluations', path: '/academic/evaluations', icon: IconNotebook },
  { label: 'Required exams', path: '/academic/required-exams', icon: IconFlag },
  { label: 'Test results', path: '/academic/test-results', icon: IconActivity },
  { label: 'Absences', path: '/academic/absences', icon: IconCalendar },
  { label: 'Follow-ups', path: '/academic/follow-ups', icon: IconFileText },
  { label: 'Title validation', path: '/academic/title-validation', icon: IconCertificate },
  { label: 'Log time', path: '/academic/log-time', icon: IconClock },
  { label: 'Badges', path: '/academic/badges', icon: IconSparkles },
  { label: 'Collaborations', path: '/academic/collaborations', icon: IconPuzzle },
  { label: 'Documents', path: '/academic/documents', icon: IconFileText },
  { label: 'Pedagogical journey', path: '/academic/journey', icon: IconAdjustments },
];

const sideGroups = [
  { title: '< OVERVIEW />', links: [
    { label: 'Dashboard', path: '/', icon: IconGauge },
    { label: 'Academic details', path: '/academic/required-exams', icon: IconFileText },
    { label: 'Planning', path: '/planning', icon: IconCalendar },
  ] },
  { title: '< PEDAGOGY />', links: [
    { label: 'Units', path: '/units', icon: IconBook2 },
    { label: 'Projects', path: '/projects', icon: IconPuzzle },
    { label: 'E-learning', path: '/e-learning', icon: IconDeviceLaptop },
  ] },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpened, mobileNav] = useDisclosure(false);
  const [searchOpened, search] = useDisclosure(false);
  const [query, setQuery] = useState('');
  const [notificationOpened, notifications] = useDisclosure(false);
  const [profileOpened, profile] = useDisclosure(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        search.open();
      }
      if (event.key === 'Escape') search.close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [search]);

  const navLinks = useMemo(() => [...sideGroups.flatMap((group) => group.links), ...topTabs], []);
  const results = navLinks.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  const go = (path: string) => {
    navigate(path);
    mobileNav.close();
    search.close();
    setQuery('');
  };

  const sidebar = (
    <div className="sidebar-inner">
      {sideGroups.map((group) => (
        <section className="nav-group" key={group.title}>
          <div className="nav-caption">{group.title}</div>
          {group.links.map((item) => {
            const Icon = item.icon;
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return <NavLink key={item.path} className="side-link" active={active} label={item.label}
              leftSection={<Icon size={15} stroke={1.8} />} onClick={() => go(item.path)} />;
          })}
        </section>
      ))}
      <div className="sidebar-foot">
        <div className="sidebar-foot-mark"><span>MYA</span><span>STUDENT SPACE</span></div>
        <span className="sidebar-version">ACADEMIC YEAR 2026–27</span>
      </div>
    </div>
  );

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="brand">
          <Burger opened={mobileNavOpened} onClick={mobileNav.toggle} hiddenFrom="sm" size="sm" aria-label="Open navigation" />
          <button className="brand-wordmark" onClick={() => go('/')} aria-label="Epitech home">
            <span className="brand-brace">{'{'}</span>EPITECH<span className="brand-brace">{'}'}</span>
          </button>
        </div>
        <button className="search-trigger" onClick={search.open}>
          <IconSearch size={16} stroke={1.8} /><span>Search…</span><kbd>CTRL + K</kbd>
        </button>
        <div className="top-actions">
          <Popover opened={notificationOpened} onChange={(opened) => opened ? notifications.open() : notifications.close()} position="bottom-end" shadow="md" width={290}>
            <Popover.Target>
              <ActionIcon variant="subtle" color="white" className="top-icon" aria-label="Notifications" onClick={notifications.toggle}>
                <IconBell size={18} stroke={1.8} /><i className="notification-dot" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown className="popover-panel">
              <Text fw={700} size="sm">Notifications</Text><Divider my="sm" />
              <Text size="sm">Your latest required exam score is ready.</Text>
              <Text size="xs" c="dimmed" mt={6}>18 September · Academic details</Text>
            </Popover.Dropdown>
          </Popover>
          <Popover opened={profileOpened} onChange={(opened) => opened ? profile.open() : profile.close()} position="bottom-end" shadow="md" width={220}>
            <Popover.Target>
              <button className="profile-trigger" onClick={profile.toggle}>
                <Avatar size={36} radius={4} color="dark" className="top-avatar">EP</Avatar>
                <span className="profile-name">STUDENT PROFILE</span><IconChevronDown size={14} />
              </button>
            </Popover.Target>
            <Popover.Dropdown className="popover-panel">
              <Text fw={700} size="sm">Student profile</Text><Divider my="sm" />
              <Button variant="subtle" size="xs" fullWidth leftSection={<IconUser size={14} />}
                onClick={() => { go('/academic/overview'); profile.close(); }}>Student profile</Button>
            </Popover.Dropdown>
          </Popover>
          <Tooltip label="Quick navigation">
            <ActionIcon variant="subtle" color="white" className="top-icon apps-button" aria-label="Quick navigation" onClick={search.open}>
              <IconApps size={19} stroke={1.8} />
            </ActionIcon>
          </Tooltip>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">{sidebar}</aside>
        <Drawer opened={mobileNavOpened} onClose={mobileNav.close}
          title={<span className="drawer-title">EPITECH · MENU</span>} size={280} padding={0} hiddenFrom="sm"
          classNames={{ content: 'mobile-drawer', header: 'mobile-drawer-header', body: 'mobile-drawer-body' }}>
          {sidebar}
        </Drawer>
        <main className="main-content">
          <StudentCard />
          <nav className="academic-nav" aria-label="Academic details">
            {topTabs.map((tab) => {
              const Icon = tab.icon;
              const active = location.pathname === tab.path;
              return (
                <button key={tab.path} className={'academic-tab ' + (active ? 'is-active' : '')} onClick={() => go(tab.path)}>
                  <Icon size={15} stroke={1.8} /><span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          <Routes>
            <Route path="/" element={<Navigate to="/academic/required-exams" replace />} />
            <Route path="/academic/required-exams" element={<RequiredExams onNavigate={go} />} />
            <Route path="/academic/*" element={<SectionPreview title={topTabs.find((tab) => tab.path === location.pathname)?.label ?? 'Academic details'} />} />
            <Route path="*" element={<SectionPreview title={sideGroups.flatMap((group) => group.links).find((item) => item.path === location.pathname)?.label ?? 'Student space'} />} />
          </Routes>
        </main>
      </div>

      <Modal opened={searchOpened} onClose={search.close}
        title={<div className="search-modal-title"><IconCommand size={17} /> Jump to a section</div>}
        centered size="md" classNames={{ content: 'search-modal', header: 'search-modal-header', body: 'search-modal-body' }}>
        <TextInput autoFocus leftSection={<IconSearch size={16} />} placeholder="Search academic details, units…"
          value={query} onChange={(event) => setQuery(event.currentTarget.value)}
          rightSection={<ActionIcon variant="subtle" onClick={search.close} aria-label="Close"><IconX size={15} /></ActionIcon>} />
        <div className="command-results">
          {results.length ? results.slice(0, 8).map((item) => {
            const Icon = item.icon;
            return <button className="command-result" key={item.path + '-' + item.label} onClick={() => go(item.path)}>
              <Icon size={16} /><span>{item.label}</span><IconChevronRight size={15} />
            </button>;
          }) : <div className="command-empty">No sections match “{query}”. Try another term.</div>}
        </div>
        <div className="command-hint"><span>Navigate with your keyboard</span><kbd>ESC</kbd></div>
      </Modal>
    </div>
  );
}

function StudentCard() {
  return (
    <section className="student-card">
      <div className="student-identity">
        <Avatar size={64} radius={6} color="dark" className="student-avatar">EP</Avatar>
        <div className="student-info">
          <div className="student-heading-row"><h1>MY SCHOOLING</h1><Badge className="mobile-status" color="red" variant="light">ALERT</Badge></div>
          <div className="student-name-line"><strong>International exchange</strong><span>Explore your study options</span></div>
        </div>
      </div>
      <div className="student-metrics">
        <div className="student-metric"><span>GPA <Tooltip label="Grade point average"><IconTarget size={12} /></Tooltip></span><strong>3.39</strong></div>
        <div className="student-metric credits"><span>CREDITS</span><strong>121</strong></div>
        <div className="student-metric status"><span>STATUS</span><Badge color="red" variant="light">ALERT</Badge></div>
      </div>
    </section>
  );
}

function RequiredExams({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [showHistory, setShowHistory] = useState(true);
  return (
    <section className="page-section">
      <div className="section-heading">
        <div><div className="eyebrow">ACADEMIC DETAILS <span>/</span> REQUIRED EXAMS</div><h2>REQUIRED EXAMS<span className="title-caret">_</span></h2></div>
        <div className="section-actions"><span className="sync-label"><i /> UPDATED 18 SEP 2026</span></div>
      </div>
      <div className="exam-grid">
        <article className="panel score-panel">
          <div className="panel-label">CURRENT SCORE<span>_</span></div>
          <div className="score-line"><strong>685</strong><span>/ 990</span></div>
          <div className="score-delta">−65 <span>VS TARGET</span></div>
          <Divider my="sm" />
          <div className="target-line"><span>target</span><strong>750</strong></div>
          <Progress value={69.2} color="magenta" size={4} radius={0} mt={16} aria-label="Current score as a percentage of maximum" />
          <div className="score-context"><span><i className="legend-current" />CURRENT SCORE</span><span><i className="legend-target" />TARGET</span></div>
          <div className="panel-footnote">Your score is 65 points below the required threshold.</div>
        </article>
        <article className="panel progression-panel">
          <div className="panel-topline"><div className="panel-label">PROGRESSION<span>_</span></div><div className="period-select">LAST 2 ATTEMPTS <IconChevronDown size={13} /></div></div>
          <ScoreChart />
          <div className="chart-caption"><span>Source · Required exam history</span><span>2 attempts recorded</span></div>
        </article>
      </div>
      <article className="panel history-panel">
        <div className="history-heading">
          <div><div className="panel-label">HISTORY<span>_</span></div><p>Exam attempts <span>·</span> 2 records</p></div>
          <Button className="history-toggle" variant="subtle" size="xs" onClick={() => setShowHistory((value) => !value)}>
            {showHistory ? 'Hide history' : 'Show history'} <IconChevronDown className={showHistory ? 'rotate-up' : ''} size={14} />
          </Button>
        </div>
        {showHistory && <>
          <div className="desktop-table">
            <Table className="exam-table" verticalSpacing="sm" horizontalSpacing="sm">
              <Table.Thead><Table.Tr><Table.Th>Date</Table.Th><Table.Th>Score</Table.Th><Table.Th>Status</Table.Th><Table.Th>Progress</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>{examRows.map((row) => <Table.Tr key={row.date}>
                <Table.Td><span className="date-cell">{row.date}</span></Table.Td>
                <Table.Td><strong className="table-score">{row.score}</strong><span className="table-denom"> / 990</span></Table.Td>
                <Table.Td><Badge className="status-badge" color="red" variant="light">{row.state}</Badge></Table.Td>
                <Table.Td><span className="attempt-progress"><i style={{ width: (row.score / 990 * 100) + '%' }} /></span></Table.Td>
              </Table.Tr>)}</Table.Tbody>
            </Table>
          </div>
          <div className="mobile-attempts">{examRows.map((row) => <div className="attempt-card" key={row.date}>
            <div><span className="date-cell">{row.date}</span><Badge className="status-badge" color="red" variant="light">{row.state}</Badge></div>
            <strong>{row.score}<small> / 990</small></strong>
            <Progress value={row.score / 990 * 100} color="magenta" size={4} radius={0} />
          </div>)}</div>
        </>}
        <div className="data-note"><IconFileText size={14} /><span>Scores are shown as recorded in your academic file.</span>
          <button onClick={() => onNavigate('/academic/test-results')}>View exam details <IconChevronRight size={13} /></button>
        </div>
      </article>
    </section>
  );
}

function ScoreChart() {
  return (
    <div className="chart-wrap" role="img" aria-label="Exam scores improved from 410 points on September 16 to 685 points on September 18. The target is 750 points.">
      <div className="chart-y-labels"><span>990</span><span>750</span><span>500</span><span>250</span><span>0</span></div>
      <div className="chart-plot">
        <div className="chart-grid-line line-990"><span>990</span></div>
        <div className="chart-grid-line line-target"><span>TARGET&nbsp; 750</span></div>
        <div className="chart-grid-line line-500"><span>500</span></div>
        <div className="chart-grid-line line-250"><span>250</span></div>
        <div className="bars">{[
          { score: 410, date: '16 SEP', kind: 'previous' },
          { score: 685, date: '18 SEP', kind: 'current' },
        ].map((item) => <div className="bar-column" key={item.date}>
          <span className={'bar-value ' + item.kind}>{item.score}</span>
          <div className={'bar ' + item.kind} style={{ height: (item.score / 990 * 100) + '%' }} />
          <span className="bar-date">{item.date}<small>2026</small></span>
        </div>)}</div>
      </div>
    </div>
  );
}

function SectionPreview({ title }: { title: string }) {
  return (
    <section className="page-section preview-section">
      <div className="section-heading"><div><div className="eyebrow">STUDENT SPACE <span>/</span> ACADEMIC DETAILS</div><h2>{title.toUpperCase()}<span className="title-caret">_</span></h2></div></div>
      <article className="panel preview-panel">
        <div className="preview-icon"><IconNotebook size={24} /></div>
        <div><div className="panel-label">SECTION PREVIEW<span>_</span></div><h3>{title}</h3>
          <p>This view is ready for your academic data. Required exam scores are available in the exam history.</p>
          <Button onClick={() => window.history.back()} variant="default" size="xs" leftSection={<IconChevronRight className="back-chevron" size={14} />}>Return to previous page</Button>
        </div>
      </article>
    </section>
  );
}

export default App;
