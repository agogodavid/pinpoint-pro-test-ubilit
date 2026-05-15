import { uniqueNamesGenerator, adjectives, animals, NumberDictionary } from 'unique-names-generator';
export function generateCodename(): string {
  const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
  const shortName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals, numberDictionary],
    length: 3,
    separator: '-',
    style: 'upperCase'
  });
  return shortName;
}