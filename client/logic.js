// Pure helpers shared between the browser and Node's built-in test runner.
export const normalize = value => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');
export function matchesPuppy(pup, { search = '', breed = '', origin = '' } = {}) {
  const words = normalize(Object.values(pup).join(' '));
  return words.includes(normalize(search)) && (!breed || normalize(pup.Breed).includes(normalize(breed))) &&
    (!origin || (origin === 'imported' ? /import/i.test(pup.Where) : !/import/i.test(pup.Where)));
}
export const wrapIndex = (index, count) => count ? ((index % count) + count) % count : 0;
export function enquiryText(data, puppy = '') {
  return `Hello TeddyPups! My name is ${data.name}.\nPhone: ${data.phone}${data.email ? `\nEmail: ${data.email}` : ''}${data.area ? `\nArea: ${data.area}` : ''}${puppy ? `\nInterested in: ${puppy}` : ''}${data.message ? `\n\n${data.message}` : ''}`;
}
