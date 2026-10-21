import { useState } from 'react';
import { Checkbox, Popover, TextInput } from '@mantine/core';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { translatedData, useLanguage } from '../../features/schools/i18n';

interface MultiFilterProps {
  placeholder: string;
  options: (string | { value: string; label: string })[];
  value: string[];
  onChange: (value: string[]) => void;
  searchable?: boolean;
  badge?: string | null;
  headerAction?: ReactNode;
}

export function MultiFilter({ placeholder, options, value, onChange, searchable = true, badge, headerAction }: MultiFilterProps) {
  const { language, t } = useLanguage();
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');
  const normalizedOptions = options.map((option) => typeof option === 'string' ? { value: option, label: option } : option).map((option) => ({
    ...option,
    label: t(option.label) !== option.label ? t(option.label) : translatedData(option.label, 'countries', language) !== option.label ? translatedData(option.label, 'countries', language)
      : translatedData(option.label, 'specializations', language) !== option.label ? translatedData(option.label, 'specializations', language)
        : translatedData(option.label, 'languages', language),
  }));
  const selectedOptions = normalizedOptions.filter((option) => value.includes(option.value));
  const visibleOptions = normalizedOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  const buttonLabel = selectedOptions.length === 0 ? placeholder
    : selectedOptions.length === 1 ? selectedOptions[0].label
      : language === 'fr' ? `${selectedOptions.length} sélectionnés` : `${selectedOptions.length} selected`;
  const toggleOption = (optionValue: string) => onChange(value.includes(optionValue)
    ? value.filter((item) => item !== optionValue) : [...value, optionValue]);

  return <Popover opened={opened} onChange={setOpened} position="bottom-start" offset={4} shadow="md" width={280} withinPortal>
    <Popover.Target><button type="button" className="multi-filter-trigger" onClick={() => setOpened((current) => !current)}
      aria-label={`${placeholder}${selectedOptions.length ? `, ${selectedOptions.length} selected` : ''}`} aria-expanded={opened}>
      <span className={selectedOptions.length ? 'has-selection' : ''}>{selectedOptions.length === 0 ? t(placeholder) : buttonLabel}</span>
      {badge ? <small className="multi-filter-mode-badge">{badge}</small> : selectedOptions.length > 1 && <small>{selectedOptions.length}</small>}
      <IconChevronDown size={14} />
    </button></Popover.Target>
    <Popover.Dropdown className="multi-filter-dropdown">
      <div className="multi-filter-heading"><strong>{t(placeholder)}</strong>{headerAction || <span>{selectedOptions.length ? (language === 'fr' ? `${selectedOptions.length} sélectionnés` : `${selectedOptions.length} selected`) : language === 'fr' ? `${normalizedOptions.length} options` : `${normalizedOptions.length} options`}</span>}</div>
      {searchable && <TextInput className="multi-filter-search" placeholder={language === 'fr' ? `Rechercher : ${t(placeholder).toLocaleLowerCase()}` : `Search ${placeholder.toLowerCase()}`} value={query}
        onChange={(event) => setQuery(event.currentTarget.value)} aria-label={language === 'fr' ? `Rechercher ${t(placeholder)}` : `Search ${placeholder}`} />}
      <div className="multi-filter-options">
        {visibleOptions.length ? visibleOptions.map((option) => {
          const selected = value.includes(option.value);
          return <button type="button" className={'multi-filter-option' + (selected ? ' selected' : '')} key={option.value}
            onClick={() => toggleOption(option.value)} aria-pressed={selected}>
            <span className="multi-filter-check">{selected && <IconCheck size={12} stroke={2.5} />}</span>
            <span>{option.label}</span>
          </button>;
        }) : <div className="multi-filter-empty">{t('No matching options')}</div>}
      </div>
      <div className="multi-filter-footer">
        <button type="button" className="multi-filter-clear" onClick={() => onChange([])} disabled={!value.length}>{t('Clear')}</button>
        <button type="button" className="multi-filter-done" onClick={() => setOpened(false)}>{t('Done')}</button>
      </div>
    </Popover.Dropdown>
  </Popover>;
}
