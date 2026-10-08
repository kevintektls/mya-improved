interface EpitechLoaderProps {
  label: string;
  overlay?: boolean;
  inline?: boolean;
}

export function EpitechLoader({ label, overlay = false, inline = false }: EpitechLoaderProps) {
  const className = ['epitech-loader', overlay && 'epitech-loader--overlay', inline && 'epitech-loader--inline']
    .filter(Boolean)
    .join(' ');

  return <div className={className} role="status" aria-label={label} aria-live="polite">
    <span className="epitech-loader-bars" aria-hidden="true"><i /><i /><i /></span>
    {inline && <span className="epitech-loader-label">{label}</span>}
  </div>;
}
