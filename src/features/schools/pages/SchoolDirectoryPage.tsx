import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Checkbox, Pagination, Select, TextInput } from '@mantine/core';
import { IconDownload, IconFilter, IconPrinter, IconSearch, IconX } from '@tabler/icons-react';
import { MultiFilter } from '../../../components/schools/MultiFilter';
import { SchoolCard } from '../../../components/schools/SchoolCard';
import { defaultFavoriteDetails } from '../data/studentWorkspace';
import { downloadSavedSchoolsCsv } from '../utils/schoolExports';
import type { FavoriteDetails, SchoolRecord } from '../types';
import { translatedData, translatedLanguageList, translatedSchoolName, useLanguage } from '../i18n';

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
  const { language, t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const savedOnly = params.get('view') === 'saved';
  const [search, setSearch] = useState('');
  const [schoolIds, setSchoolIds] = useState<string[]>([]);
  const [country, setCountry] = useState(params.getAll('country'));
  const [specialization, setSpecialization] = useState(params.getAll('specialization'));
  const [strictStudyAreas, setStrictStudyAreas] = useState(false);
  const [semester, setSemester] = useState<string[]>([]);
  const [sort, setSort] = useState<'name' | 'spots' | 'cost' | 'gpa' | 'gpa-desc'>('name');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const schoolOptions = useMemo(() => schools.map((school) => ({ value: String(school.id), label: translatedSchoolName(school.name, school.nameFr, language) })), [schools, language]);

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
    const searchableValues = [school.name, school.nameFr, school.country, translatedData(school.country, 'countries', language), ...(school.specializations || []), ...(school.specializations || []).map((area) => translatedData(area, 'specializations', language))];
    const text = searchableValues.filter(Boolean).join(' ').toLowerCase();
    return (!savedOnly || saved.includes(school.id)) &&
      (!schoolIds.length || schoolIds.includes(String(school.id))) &&
      (!search || text.includes(search.toLowerCase())) &&
      (!country.length || country.includes(school.country)) &&
      (!specialization.length || (strictStudyAreas
        ? specialization.every((area) => school.specializations?.includes(area))
        : specialization.some((area) => school.specializations?.includes(area)))) &&
      (!semester.length || semester.includes(school.semester));
  }).sort((a, b) => {
    const byName = a.name.localeCompare(b.name);
    if (sort === 'spots') return b.spots - a.spots || byName;
    if (sort === 'cost') return a.extracharge - b.extracharge || byName;
    if (sort === 'gpa' || sort === 'gpa-desc') {
      const aOpen = a.gpa <= 0;
      const bOpen = b.gpa <= 0;
      if (aOpen !== bOpen) return aOpen ? 1 : -1;
      return (sort === 'gpa' ? a.gpa - b.gpa : b.gpa - a.gpa) || byName;
    }
    return byName;
  }),
  [savedOnly, saved, schoolIds, search, country, specialization, strictStudyAreas, semester, sort, language]);

  useEffect(() => setPage(1), [savedOnly, schoolIds, search, country, specialization, strictStudyAreas, semester, sort]);
  const pageCount = Math.ceil(filtered.length / pageSize);
  const visibleSchools = filtered.slice((page - 1) * pageSize, page * pageSize);
  const savedSchools = schools.filter((school) => saved.includes(school.id));

  const clearFilters = () => { setSearch(''); setSchoolIds([]); setCountry([]); setSpecialization([]); setStrictStudyAreas(false); setSemester([]); setSort('name'); setParams(savedOnly ? { view: 'saved' } : {}); };
  const activeCount = country.length + specialization.length + semester.length + schoolIds.length + (search ? 1 : 0);
  const directoryTitle = savedOnly ? t('SAVED SCHOOLS') : country.length === 1
    ? `${language === 'fr' ? 'UNIVERSITÉS EN' : 'SCHOOLS IN'} ${translatedData(country[0], 'countries', language).toLocaleUpperCase()}`
    : country.length > 1 ? (language === 'fr' ? `UNIVERSITÉS DANS ${country.length} PAYS` : `SCHOOLS IN ${country.length} COUNTRIES`) : t('PARTNER SCHOOLS');

  return <section className="page-section school-directory">
    <div className="section-heading directory-heading">
      <div><div className="eyebrow">{t('INTERNATIONAL MOBILITY')} <span>/</span> {savedOnly ? t('YOUR SHORTLIST') : t('PARTNER DIRECTORY')}</div>
        <h2>{directoryTitle}<span className="title-caret">_</span></h2>
        <p className="section-deck">{t('Compare destinations, study options and application details for your exchange.')}</p>
      </div>
      <div className="directory-result-count"><strong>{filtered.length.toString().padStart(2, '0')}</strong><span>{t('RESULTS')}</span></div>
    </div>

    {savedOnly && savedSchools.length > 0 && <div className="saved-export-actions">
      <span>{language === 'fr' ? `${savedSchools.length} université${savedSchools.length > 1 ? 's' : ''} enregistrée${savedSchools.length > 1 ? 's' : ''} · conservée${savedSchools.length > 1 ? 's' : ''} dans ce navigateur` : `${savedSchools.length} saved ${savedSchools.length === 1 ? 'school' : 'schools'} · stored in this browser`}</span>
      <Button variant="default" size="xs" leftSection={<IconDownload size={14} />} onClick={() => downloadSavedSchoolsCsv(savedSchools, favoriteDetails)}>{t('Export CSV')}</Button>
      <Button variant="default" size="xs" leftSection={<IconPrinter size={14} />} onClick={() => window.print()}>{t('Print / save PDF')}</Button>
    </div>}

    <div className="filters-panel">
      <TextInput className="school-search" leftSection={<IconSearch size={16} />} placeholder={t('Search schools or destinations')} value={search}
        onChange={(event) => setSearch(event.currentTarget.value)} aria-label={t('Search schools or destinations')} />
      <MultiFilter placeholder="Partner schools" options={schoolOptions} value={schoolIds} onChange={setSchoolIds} />
      <MultiFilter placeholder="Countries" options={countries} value={country} onChange={(value) => { setCountry(value); updateParamValues('country', value); }} />
      <MultiFilter placeholder="Study areas" options={specializations} value={specialization}
        onChange={(value) => { setSpecialization(value); updateParamValues('specialization', value); }} badge={strictStudyAreas && specialization.length ? 'ALL' : null}
        headerAction={<Checkbox className="strict-study-checkbox" size="xs" color="epitech" label={t('Require all')} checked={strictStudyAreas}
          onChange={(event) => setStrictStudyAreas(event.currentTarget.checked)} disabled={!specialization.length} aria-label={t('Require all selected study areas')} />}
      />
      <MultiFilter placeholder="Duration" options={studyOptions} value={semester} onChange={setSemester} searchable={false} />
      <Select className="sort-select" data={[{ value: 'name', label: t('A–Z') }, { value: 'spots', label: t('Most places') }, { value: 'cost', label: t('Lowest extra cost') }, { value: 'gpa', label: t('Lowest GPA') }, { value: 'gpa-desc', label: t('Highest GPA') }]}
        value={sort} onChange={(value) => setSort((value as typeof sort | null) || 'name')} aria-label={language === 'fr' ? 'Trier les universités' : 'Sort schools'} />
      {activeCount > 0 && <Button className="clear-filters" variant="subtle" size="xs" leftSection={<IconX size={13} />} onClick={clearFilters}>{language === 'fr' ? `Effacer (${activeCount})` : `Clear (${activeCount})`}</Button>}
    </div>

    {filtered.length ? <>
      <div className="school-grid">{visibleSchools.map((school, index) =>
      <SchoolCard key={school.id} school={school} saved={saved.includes(school.id)} onToggleSaved={toggleSaved}
        compared={compared.includes(school.id)} compareDisabled={compared.length >= 4} onToggleCompare={toggleCompared}
        showFavoriteEditor={savedOnly} favoriteDetails={favoriteDetails[school.id] || defaultFavoriteDetails()} onFavoriteDetailsChange={updateFavoriteDetails} index={index} />)}</div>
      {pageCount > 1 && <div className="directory-pagination">
        <span>{language === 'fr' ? `${((page - 1) * pageSize + 1).toString().padStart(2, '0')}–${Math.min(page * pageSize, filtered.length).toString().padStart(2, '0')} SUR ${filtered.length} UNIVERSITÉS` : `SHOWING ${((page - 1) * pageSize + 1).toString().padStart(2, '0')}–${Math.min(page * pageSize, filtered.length).toString().padStart(2, '0')} OF ${filtered.length} SCHOOLS`}</span>
        <Pagination total={pageCount} value={page} onChange={setPage} size="sm" siblings={1} boundaries={1} withEdges aria-label="School directory pages" />
      </div>}
    </>
      : <div className="empty-results"><IconFilter size={25} /><h3>{savedOnly && saved.length === 0 ? t('Your shortlist is empty') : t('No schools found')}</h3>
        <p>{savedOnly && saved.length === 0 ? t('Save a partner school with the heart button to keep it here.') : t('Try a different search or clear one of your filters.')}</p>
        {activeCount > 0 && <Button variant="default" size="xs" onClick={clearFilters}>{t('Clear filters')}</Button>}</div>}
    {savedOnly && savedSchools.length > 0 && <div className="saved-print-document">
      <h1>{t('My Epitech mobility shortlist')}</h1><p>{savedSchools.length} {t('saved partner schools')}</p>
      <table><thead><tr><th>{t('University')}</th><th>{t('Country')}</th><th>{t('Study areas')}</th><th>{t('Places')}</th><th>{t('Minimum GPA')}</th><th>{t('Extra cost')}</th><th>{t('Language')}</th><th>{t('Duration')}</th><th>{t('Priority / note')}</th></tr></thead>
        <tbody>{savedSchools.map((school) => <tr key={school.id}><td>{translatedSchoolName(school.name, school.nameFr, language)}</td><td>{translatedData(school.country, 'countries', language)}</td><td>{school.specializations.map((area) => translatedData(area, 'specializations', language)).join(', ') || '—'}</td>
          <td>{school.spots || '—'}</td><td>{school.gpa ? school.gpa.toFixed(1) : t('Open')}</td><td>{school.extracharge ? `€${school.extracharge.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}` : t('None listed')}</td>
          <td>{translatedLanguageList(school.language, language) || '—'}</td><td>{t(school.semester)}</td><td>{t((favoriteDetails[school.id]?.priority || 'medium').toUpperCase())} · {favoriteDetails[school.id]?.note || '—'}</td></tr>)}</tbody></table>
    </div>}
  </section>;
}
