export function chooseLanguage(saved, languages = []) {
  if (saved === 'lt' || saved === 'en') return saved;
  for (const language of languages) {
    const short = language.toLowerCase().split('-')[0];
    if (short === 'lt' || short === 'en') return short;
  }
  return 'en';
}
