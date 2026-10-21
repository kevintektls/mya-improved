import { Avatar } from '@mantine/core';
import { IconWorld } from '@tabler/icons-react';
import { useLanguage } from '../../features/schools/i18n';

export function StudentSummary({ schoolCount, countryCount, areaCount }: { schoolCount: number; countryCount: number; areaCount: number }) {
  const { t } = useLanguage();
  return <section className="student-card catalog-summary">
    <div className="student-identity"><Avatar size={62} radius={6} color="dark" className="student-avatar"><IconWorld size={23} /></Avatar>
      <div className="student-info"><div className="student-heading-row"><h1>{t('GLOBAL OPPORTUNITIES')}</h1></div>
        <div className="student-name-line"><strong>{t('International exchange')}</strong><span>{t('Explore your study options')}</span></div>
      </div>
    </div>
    <div className="student-metrics catalog-metrics">
      <div className="student-metric"><span>{t('PARTNER SCHOOLS')}</span><strong>{schoolCount}</strong></div>
      <div className="student-metric credits"><span>{t('COUNTRIES')}</span><strong>{countryCount}</strong></div>
      <div className="student-metric"><span>{t('STUDY AREAS')}</span><strong>{areaCount}</strong></div>
    </div>
  </section>;
}
