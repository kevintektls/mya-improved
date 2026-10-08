import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Checkbox, Pagination, Select, TextInput } from '@mantine/core';
import { IconDownload, IconFilter, IconPrinter, IconSearch, IconX } from '@tabler/icons-react';
import { MultiFilter } from '../../../components/schools/MultiFilter';
import { SchoolCard } from '../../../components/schools/SchoolCard';
import { defaultFavoriteDetails } from '../data/studentWorkspace';
import { downloadSavedSchoolsCsv } from '../utils/schoolExports';
import type { FavoriteDetails, SchoolRecord } from '../types';

const studyOptions: { value: string; label: string }[] = [
  { value: 'Full-year only', label: 'Full year' },
  { value: 'Semester only', label: 'Semester' },
  { value: 'Full-year or semester', label: 'Flexible duration' },
];

interface SchoolDirectoryProps {
  schools: SchoolRecord[];
  countries: string[];
  specializations: string[];
  saved: number[];
  toggleSaved: (id: number) => void;
  compared: number[];
  toggleCompared: (id: number) => void;
  favoriteDetails: Record<number, FavoriteDetails>;
  updateFavoriteDetails: (id: number, details: FavoriteDetails) => void;
}

export function SchoolDirectory({ schools, countries, specializations, saved, toggleSaved, compared, toggleCompared, favoriteDetails, updateFavoriteDetails }: SchoolDirectoryProps) {
  const [params, setParams] = useSearchParams();
  const savedOnly = params.get('view') === 'saved';
  const [search, setSearch] = useState('');
  const [schoolIds, setSchoolIds] = useState<string[]>([]);
  const [country, setCountry] = useState(params.getAll('country'));
  const [specialization, setSpecialization] = useState(params.getAll('specialization'));
  const [strictStudyAreas, setStrictStudyAreas] = useState(false);
  const [semester, setSemester] = useState<string[]>([]);
  const [sort, setSort] = useState<'name' | 'spots' | 'cost'>('name');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const schoolOptions = useMemo(() => schools.map((school) => ({ value: String(school.id), label: school.name })), [schools]);

  useEffect(() => {
    setCountry(params.getAll('country'));
    setSpecialization(params.getAll('specialization'));
  }, [params]);
  const updateParamValues = (key: 'country' | 'specialization', values: string[]) => {
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
  const savedSchools = schools.filter((school) => saved.includes(school.id));

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

    {savedOnly && savedSchools.length > 0 && <div className="saved-export-actions">
      <span>{savedSchools.length} saved {savedSchools.length === 1 ? 'school' : 'schools'} · stored in this browser</span>
      <Button variant="default" size="xs" leftSection={<IconDownload size={14} />} onClick={() => downloadSavedSchoolsCsv(savedSchools, favoriteDetails)}>Export CSV</Button>
      <Button variant="default" size="xs" leftSection={<IconPrinter size={14} />} onClick={() => window.print()}>Print / save PDF</Button>
    </div>}

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
        value={sort} onChange={(value) => setSort((value as typeof sort | null) || 'name')} aria-label="Sort schools" />
      {activeCount > 0 && <Button className="clear-filters" variant="subtle" size="xs" leftSection={<IconX size={13} />} onClick={clearFilters}>Clear ({activeCount})</Button>}
    </div>

    {filtered.length ? <>
      <div className="school-grid">{visibleSchools.map((school, index) =>
      <SchoolCard key={school.id} school={school} saved={saved.includes(school.id)} onToggleSaved={toggleSaved}
        compared={compared.includes(school.id)} compareDisabled={compared.length >= 4} onToggleCompare={toggleCompared}
        showFavoriteEditor={savedOnly} favoriteDetails={favoriteDetails[school.id] || defaultFavoriteDetails()} onFavoriteDetailsChange={updateFavoriteDetails} index={index} />)}</div>
      {pageCount > 1 && <div className="directory-pagination">
        <span>SHOWING {((page - 1) * pageSize + 1).toString().padStart(2, '0')}–{Math.min(page * pageSize, filtered.length).toString().padStart(2, '0')} OF {filtered.length} SCHOOLS</span>
        <Pagination total={pageCount} value={page} onChange={setPage} size="sm" siblings={1} boundaries={1} withEdges aria-label="School directory pages" />
      </div>}
    </>
      : <div className="empty-results"><IconFilter size={25} /><h3>{savedOnly && saved.length === 0 ? 'Your shortlist is empty' : 'No schools found'}</h3>
        <p>{savedOnly && saved.length === 0 ? 'Save a partner school with the heart button to keep it here.' : 'Try a different search or clear one of your filters.'}</p>
        {activeCount > 0 && <Button variant="default" size="xs" onClick={clearFilters}>Clear filters</Button>}</div>}
    {savedOnly && savedSchools.length > 0 && <div className="saved-print-document">
      <h1>My Epitech mobility shortlist</h1><p>{savedSchools.length} saved partner schools</p>
      <table><thead><tr><th>University</th><th>Country</th><th>Study areas</th><th>Places</th><th>Minimum GPA</th><th>Extra cost</th><th>Language</th><th>Duration</th><th>Priority / note</th></tr></thead>
        <tbody>{savedSchools.map((school) => <tr key={school.id}><td>{school.name}</td><td>{school.country}</td><td>{school.specializations.join(', ') || '—'}</td>
          <td>{school.spots || '—'}</td><td>{school.gpa ? school.gpa.toFixed(1) : 'Open'}</td><td>{school.extracharge ? `€${school.extracharge.toLocaleString('en-US')}` : 'None listed'}</td>
          <td>{school.language || '—'}</td><td>{school.semester || '—'}</td><td>{(favoriteDetails[school.id]?.priority || 'medium').toUpperCase()} · {favoriteDetails[school.id]?.note || '—'}</td></tr>)}</tbody></table>
    </div>}
  </section>;
}
