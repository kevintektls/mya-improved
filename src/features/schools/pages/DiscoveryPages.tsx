import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight, IconSparkles } from '@tabler/icons-react';
import { WorldPartnerMap } from '../../../components/schools/WorldPartnerMap';
import type { SchoolRecord } from '../types';

export function CountriesPage({ schools, countries }: { schools: SchoolRecord[]; countries: string[] }) {
  const navigate = useNavigate();
  const countByCountry = useMemo(() => Object.fromEntries(countries.map((country) => [country, schools.filter((school) => school.country === country).length])), [countries, schools]);
  return <section className="page-section discovery-page">
    <div className="section-heading"><div><div className="eyebrow">INTERNATIONAL MOBILITY <span>/</span> DESTINATIONS</div><h2>EXPLORE BY COUNTRY<span className="title-caret">_</span></h2>
      <p className="section-deck">Choose a destination to see its partner schools and exchange options.</p></div><div className="directory-result-count"><strong>{countries.length}</strong><span>COUNTRIES</span></div></div>
    <WorldPartnerMap countries={countries} countByCountry={countByCountry} />
  </section>;
}

export function SpecializationsPage({ schools, specializations }: { schools: SchoolRecord[]; specializations: string[] }) {
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
