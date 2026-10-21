import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EpitechLoader } from '../ui/EpitechLoader';
import { translatedData, useLanguage } from '../../features/schools/i18n';

interface WorldMapLocation {
  id: string;
  name: string;
  path: string;
}

interface WorldMapData {
  viewBox: string;
  locations: WorldMapLocation[];
}

const aliases: Record<string, string> = {
  chili: 'cl',
  'czech republic': 'cz',
  'south korea': 'kr',
  'united states': 'us',
  usa: 'us',
  uk: 'gb',
  'united kingdom': 'gb',
  philippine: 'ph',
  'hong kong': 'hk',
  turkey: 'tr',
};

function countryCode(country: string): string | undefined {
  const normalized = country.trim().toLocaleLowerCase();
  if (aliases[normalized]) return aliases[normalized];
  return undefined;
}

function mapCountryCode(country: string, locations: WorldMapLocation[]): string | undefined {
  const alias = countryCode(country);
  if (alias) return alias;
  const names = new Intl.DisplayNames(['en'], { type: 'region' });
  const normalized = country.trim().toLocaleLowerCase();
  return locations.find((location) => {
    try {
      return names.of(location.id.toUpperCase())?.toLocaleLowerCase() === normalized;
    } catch {
      return false;
    }
  })?.id;
}

export function WorldPartnerMap({ countries, countByCountry }: { countries: string[]; countByCountry: Record<string, number> }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [map, setMap] = useState<WorldMapData | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/world-countries.json`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Map asset unavailable');
        return await response.json() as WorldMapData;
      })
      .then((data) => { if (!cancelled) setMap(data); })
      .catch(() => { if (!cancelled) setMapError(true); });
    return () => { cancelled = true; };
  }, []);

  const countryLinks = useMemo(() => {
    const mapped = new Map<string, string>();
    if (map) countries.forEach((country) => {
      const code = mapCountryCode(country, map.locations);
      if (code) mapped.set(code, country);
    });
    return mapped;
  }, [countries, map]);

  const openCountry = (country: string) => navigate(`/schools?country=${encodeURIComponent(country)}`);

  return <section className="panel partner-map-panel" aria-labelledby="partner-map-title">
    <div className="partner-map-heading">
      <div><div className="panel-label">{language === 'fr' ? 'DESTINATIONS COUVERTES' : 'DESTINATION COVERAGE'}<span>_</span></div><h3 id="partner-map-title">{t('Partner network by country')}</h3></div>
      <span className="map-total">{countries.length} {t('COUNTRIES')}</span>
    </div>
    <div className="partner-map-layout">
      <div className="world-map-wrap">
        {!map && !mapError && <EpitechLoader label={t('Loading country map')} inline />}
        {map && <svg className="world-map" viewBox={map.viewBox} role="group" aria-labelledby="world-map-title" preserveAspectRatio="xMidYMid meet">
          <title id="world-map-title">{t('University map. Select a highlighted country to view partner universities.')}</title>
          {map.locations.map((location) => {
            const country = countryLinks.get(location.id);
            const count = country ? countByCountry[country] : 0;
            return <path key={location.id} d={location.path} className={country ? 'world-map-country has-partners' : 'world-map-country'}
              role={country ? 'button' : undefined} tabIndex={country ? 0 : -1}
              aria-label={country ? `${translatedData(country, 'countries', language)}, ${count} ${count === 1 ? t('school') : t('schools')}` : undefined}
              onClick={country ? () => openCountry(country) : undefined}
              onKeyDown={country ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCountry(country); }
              } : undefined}>
              <title>{country ? translatedData(country, 'countries', language) : location.name}</title>
            </path>;
          })}
        </svg>}
        {mapError && <div className="map-unavailable" role="status">{t('The map could not be loaded. Use the country list to explore destinations.')}</div>}
        <a className="map-attribution" href="https://github.com/VictorCazanave/svg-maps" target="_blank" rel="noreferrer">Map shapes: svg-maps · CC BY 4.0</a>
      </div>
      <div className="map-country-list" aria-label={t('Countries with partner universities')}>
        {countries.map((country) => <button key={country} className="map-country-link" onClick={() => openCountry(country)}>
          <span>{translatedData(country, 'countries', language)}</span><strong>{countByCountry[country]}</strong>
        </button>)}
      </div>
    </div>
  </section>;
}
