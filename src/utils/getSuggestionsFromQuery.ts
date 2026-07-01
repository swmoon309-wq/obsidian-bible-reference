import {
  BibleReferencePluginSettings,
  BookNameLanguageEnum,
} from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { BOOK_REG } from './regs'
import { getFullBookName } from './bookNameReference'
import { getBibleVersion } from '../data/BibleVersionCollection'
import { splitBibleReference } from './splitBibleReference'

/**
 * Get suggestions from string query
 * @param queryWithoutPrefix without the prefix trigger
 * @param settings
 */
export const getSuggestionsFromQuery = async (
  queryWithoutPrefix: string,
  settings: BibleReferencePluginSettings,
  translation?: string
): Promise<VerseSuggesting[]> => {
  console.debug(
    'get suggestion for query ',
    queryWithoutPrefix.toLowerCase(),
    translation,
    settings.bibleVersion,
    settings.defaultBibleVersion
  )

  const bookNameMatchingResults = queryWithoutPrefix.match(BOOK_REG)
  const rawBookName = bookNameMatchingResults?.length
    ? bookNameMatchingResults[0]
    : undefined

  if (!rawBookName) {
    console.error(`could not find through query`, queryWithoutPrefix)
    return []
  }

  const translationLower = translation?.toLowerCase() ?? ''
  const resolvedKey = translationLower
    ? getBibleVersion(translationLower).key
    : ''
  const effectiveVersion =
    resolvedKey && resolvedKey === translationLower
      ? resolvedKey
      : settings.bibleVersion
  const selectedBibleVersion = getBibleVersion(effectiveVersion)
  const bookNameLanguageCode =
    settings.bookNameLanguage === BookNameLanguageEnum.English
      ? 'en'
      : (selectedBibleVersion?.code ?? 'en')
  const bookName = getFullBookName(rawBookName, bookNameLanguageCode)
  console.debug('selected bookName', bookName)

  const effectiveSettings =
    effectiveVersion !== settings.bibleVersion
      ? { ...settings, bibleVersion: effectiveVersion }
      : settings

  // Use splitBibleReference for consistent parsing and validation
  let verseRef
  try {
    verseRef = splitBibleReference(queryWithoutPrefix)
  } catch (error) {
    // Invalid reference (e.g., backwards chapter reference like Hebrews 10:1-9:14)
    console.error('Invalid Bible reference:', error)
    return []
  }

  const {
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    chapterNumberEnd,
    verseNumberEndChapter,
    ranges,
  } = verseRef

  const suggestingVerse = new VerseSuggesting(
    effectiveSettings,
    bookName,
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    chapterNumberEnd,
    verseNumberEndChapter,
    ranges
  )

  console.debug(
    bookName,
    chapterNumber,
    verseNumber,
    verseNumberEnd,
    suggestingVerse,
    settings
  )
  await suggestingVerse.fetchAndSetVersesText()
  return [suggestingVerse]
}
