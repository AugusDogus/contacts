import {
  AsYouType,
  getCountries,
  isPossiblePhoneNumber,
  type CountryCode
} from 'libphonenumber-js';

const regions = new Set<string>(getCountries());
const isRegion = (code: string | undefined): code is CountryCode =>
  code !== undefined && regions.has(code);

export const Phone = {
  /** The country a visitor most likely dials from, used for numbers typed without +. */
  region: (locale: string): CountryCode => {
    try {
      const region = new Intl.Locale(locale).maximize().region;
      return isRegion(region) ? region : 'US';
    } catch {
      return 'US';
    }
  },
  /** Formats as the number is typed, for example "3125550100" becomes "(312) 555-0100". */
  format: (value: string, region: CountryCode) => new AsYouType(region).input(value),
  isPossible: (value: string, region: CountryCode) => isPossiblePhoneNumber(value, region)
} as const;
