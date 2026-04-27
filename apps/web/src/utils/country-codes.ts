/**
 * Country code helper utilities
 */

const COUNTRY_MAP: Record<string, string> = {
  // Full names
  Russia: 'RU', Russian: 'RU',
  Ukraine: 'UA', Ukrainian: 'UA',
  France: 'FR', French: 'FR',
  Germany: 'DE', German: 'DE',
  Denmark: 'DK', Danish: 'DK',
  Sweden: 'SE', Swedish: 'SE',
  Poland: 'PL', Polish: 'PL',
  Brazil: 'BR', Brazilian: 'BR',
  'United States': 'US', American: 'US', USA: 'US',
  Canada: 'CA', Canadian: 'CA',
  'United Kingdom': 'GB', British: 'GB', UK: 'GB',
  Finland: 'FI', Finnish: 'FI',
  Norway: 'NO', Norwegian: 'NO',
  Latvia: 'LV', Latvian: 'LV',
  Estonia: 'EE', Estonian: 'EE',
  Lithuania: 'LT', Lithuanian: 'LT',
  Bosnia: 'BA', Bosnian: 'BA',
  Serbia: 'RS', Serbian: 'RS',
  Turkey: 'TR', Turkish: 'TR',
  Mongolia: 'MN', Mongolian: 'MN',
  Portugal: 'PT', Portuguese: 'PT',
  Israel: 'IL', Israeli: 'IL',
  Hungary: 'HU', Hungarian: 'HU',
  Slovakia: 'SK', Slovak: 'SK',
  Kazakhstan: 'KZ', Kazakh: 'KZ',
  Bulgaria: 'BG', Bulgarian: 'BG',
  Australia: 'AU', Australian: 'AU',
  China: 'CN', Chinese: 'CN',
  Korea: 'KR', Korean: 'KR',
  Japan: 'JP', Japanese: 'JP',
  Argentina: 'AR', Argentine: 'AR',
  International: 'EU', Europe: 'EU',
  Romania: 'RO', Romanian: 'RO',
  Guatemala: 'GT',
};

/**
 * Convert country name/code to ISO 2-letter code
 * @param country - Country name or code
 * @returns ISO 2-letter country code
 */
export function getCountryCode(country: string | null): string {
  if (!country) return 'EU';

  // If already a 2-letter code, return it uppercased
  if (country.length === 2) return country.toUpperCase();

  return COUNTRY_MAP[country] || country.slice(0, 2).toUpperCase();
}

/**
 * Get flag emoji from country code
 * @param countryCode - ISO 2-letter country code
 * @returns Flag emoji
 */
export function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code === 'EU') return '🇪🇺';
  
  // Convert country code to regional indicator symbols
  const codePoints = [...code].map(
    char => 0x1F1E6 + char.charCodeAt(0) - 65
  );
  return String.fromCodePoint(...codePoints);
}
