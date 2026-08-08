import mapper from 'bible-book-names-intl'

import {
  getTranslationBooks as getTranslationBooks1,
  BookWithAbbreviations as BookWithAbbreviations1,
} from 'bible-book-names-intl'

/**
 * getTranslationBooks is a function that takes a language code and returns a list of books of the Bible in that language.
 */
export const getTranslationBooks = getTranslationBooks1

/**
 * BookWithAbbreviations is a type that represents a book of the Bible.
 */
export type BookWithAbbreviations = BookWithAbbreviations1

/**
 * This is a dictionary of all the languages supported by this library.
 */
export const LanguageToBookWithAbbreviationsDict = mapper

/**
 * This is a list of all the languages supported by this library.
 */
export const SupportedLanguages = [...mapper.keys()]

export type TypeBookMatch = {
  verses: number[]
  names: string[]
}

const getAllBibleBooksInAllSupportedLanguages = (): BookWithAbbreviations[] => {
  const allBibleBooksInAllSupportedLanguages = []
  for (let i = 0; i < 66; i++) {
    // @ts-ignore
    const enTranslation = LanguageToBookWithAbbreviationsDict?.get('en')[i]
    const { fullName, verses, name, startNumber } = enTranslation

    const book: BookWithAbbreviations = {
      name, // this is the name of the book in English
      fullName, // this is the full name of the book in English
      verses,
      // Preserve startNumber so the cross-language ordinal fallback can match
      // localized numbered books (e.g. "1 Könige", "2 Corintios"); without it,
      // numbered books only resolved through the per-translation lookup.
      startNumber,
      abbreviations: [] as string[], // this will be the list of abbreviations and names for the book in all languages
      // Names/abbreviations from a translation whose own catalog needs no
      // ordinal prefix for this book, e.g. Korean's "요한일서" fuses the "1"
      // into the word itself instead of writing "1 요한서". The cross-language
      // merge above always borrows English's startNumber, which would
      // otherwise route these straight into the ordinal-prefixed matcher and
      // require a leading "1" no Korean speaker types. Collected separately so
      // the exact-match pass can accept them without reopening the ambiguity
      // that excluding bare radicals like English "Peter" is there to prevent.
      disambiguatedNames: [] as string[],
    }

    LanguageToBookWithAbbreviationsDict.forEach((books) => {
      // in different translations,
      const theBook = books[i]
      const {
        abbreviations,
        name,
        startNumber: translationStartNumber,
      } = theBook

      // concat all names from different translations
      book['abbreviations'] = [
        ...book['abbreviations'].concat(...abbreviations, name),
      ]

      if (!translationStartNumber || translationStartNumber <= 0) {
        book['disambiguatedNames'] = [
          ...(book['disambiguatedNames'] ?? []).concat(...abbreviations, name),
        ]
      }
    })
    allBibleBooksInAllSupportedLanguages.push(book)
  }
  return allBibleBooksInAllSupportedLanguages
}

/**
 * This is a list of all the books of the Bible in all the languages supported by this library.
 */
export const AllBibleBooksInAllSupportedLanguages =
  getAllBibleBooksInAllSupportedLanguages()
