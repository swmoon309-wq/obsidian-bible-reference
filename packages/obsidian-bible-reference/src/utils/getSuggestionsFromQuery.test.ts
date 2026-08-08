import { getSuggestionsFromQuery } from './getSuggestionsFromQuery'
import { DEFAULT_SETTINGS } from '../data/constants'

// splitBibleReference does not reject an unknown book - resolveBookName hands
// the candidate back unchanged - so the throw comes out of localizedBookName
// instead. That call used to sit outside the try, which turned every keystroke
// on a line like "--Notabook 1:1" into an unhandled promise rejection.
describe('getSuggestionsFromQuery with a book that does not exist', () => {
  test.each([
    'Notabook 1:1',
    'todo item 3: 1 thing',
    'see 1 Cor. 13:4', // prose in front of a numbered book: resolves to "see"
  ])('resolves to no suggestions for %s', async (query) => {
    expect(await getSuggestionsFromQuery(query, DEFAULT_SETTINGS)).toEqual([])
  })
})

// BOOK_WORD_HEAD required either 2+ characters or a single letter followed by
// a period, so Korean's single-syllable short names ("창", "시", "요"), which
// carry no trailing period, never matched. BOOK_NAME now has a dedicated
// Hangul alternative alongside the existing Han one.
describe('getSuggestionsFromQuery with a Korean single-character short name', () => {
  test.each(['창 1:1', '시 23:1', '요1 3:16'])(
    'resolves to a suggestion for %s',
    async (query) => {
      const suggestions = await getSuggestionsFromQuery(
        query,
        DEFAULT_SETTINGS,
        undefined,
        true
      )
      expect(suggestions.length).toBeGreaterThan(0)
    }
  )
})

// Korean numbered books fuse the ordinal into the word itself ("요한일서",
// not "1 요한서"), but the cross-language book merge borrowed English's
// startNumber for every language, which routed these into the
// ordinal-prefixed matcher and required a leading "1" no Korean speaker
// types. bible-book-names-intl's per-book startNumber is now 0 for these, and
// bible-reference-toolkit's exact-match pass accepts a translation's own
// disambiguated names for numbered books.
describe('getSuggestionsFromQuery with a Korean numbered book', () => {
  test.each([
    '요한일서 3:16',
    '요일 3:16',
    '사무엘상 1:1',
    '삼상 1:1',
    '고린도전서 13:4',
  ])('resolves to a suggestion for %s', async (query) => {
    const suggestions = await getSuggestionsFromQuery(
      query,
      DEFAULT_SETTINGS,
      undefined,
      true
    )
    expect(suggestions.length).toBeGreaterThan(0)
  })
})

// The numbered-book fix must not let English's ambiguous bare radicals
// ("John", "Peter") skip the ordinal requirement - "John" alone must still
// resolve to the Gospel, not silently default to 1 John.
describe('getSuggestionsFromQuery with English numbered books stays unambiguous', () => {
  test.each(['John 3:16', '1 John 1:1', '1 Peter 1:1'])(
    'resolves to a suggestion for %s',
    async (query) => {
      const suggestions = await getSuggestionsFromQuery(
        query,
        DEFAULT_SETTINGS,
        undefined,
        true
      )
      expect(suggestions.length).toBeGreaterThan(0)
    }
  )
})
