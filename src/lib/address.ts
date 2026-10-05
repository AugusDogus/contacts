import { getCountries } from 'libphonenumber-js';

type Labels = { region: string; postal: string };
const names = new Intl.DisplayNames(['en'], { type: 'region' });
// Values people typed before the country picker existed.
const aliases: Record<string, string> = {
  us: 'US',
  usa: 'US',
  'united states of america': 'US',
  uk: 'GB',
  england: 'GB'
};
const labels: Partial<Record<string, Labels>> = {
  US: { region: 'State', postal: 'ZIP code' },
  CA: { region: 'Province', postal: 'Postal code' },
  GB: { region: 'County', postal: 'Postcode' },
  AU: { region: 'State', postal: 'Postcode' },
  NZ: { region: 'Region', postal: 'Postcode' },
  IE: { region: 'County', postal: 'Eircode' },
  IN: { region: 'State', postal: 'PIN code' },
  MX: { region: 'State', postal: 'Postal code' },
  BR: { region: 'State', postal: 'CEP' },
  JP: { region: 'Prefecture', postal: 'Postal code' }
};
const countries = getCountries()
  .map((code) => ({ code, name: names.of(code) ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const Address = {
  countries,
  /** The country code for a stored country name, including common abbreviations. */
  code: (name: string) => {
    const key = name.trim().toLowerCase();
    return aliases[key] ?? countries.find((country) => country.name.toLowerCase() === key)?.code;
  },
  name: (code: string) => countries.find((country) => country.code === code)?.name ?? '',
  labels: (code: string | undefined): Labels =>
    (code && labels[code]) || { region: 'State or region', postal: 'Postal code' }
} as const;
