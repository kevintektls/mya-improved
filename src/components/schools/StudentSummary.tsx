import { Avatar } from '@mantine/core';
import { IconWorld } from '@tabler/icons-react';

export function StudentSummary({ schoolCount, countryCount, areaCount }: { schoolCount: number; countryCount: number; areaCount: number }) {
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
