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
