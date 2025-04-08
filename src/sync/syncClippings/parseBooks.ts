import { Book, groupToBooks, readMyClippingsFile } from '@hadynz/kindle-clippings';
import fs from 'fs';

import type { BookHighlight, Highlight } from '~/models';
import { hash,parseAuthors  } from '~/utils';

const formatAuthor = (author: string): string => {
  const authors = parseAuthors(author);
  return authors
    .map((a) => {
      // Check if firstName exists before including it
      const firstNamePart = a.firstName ? `, ${a.firstName}` : '';
      return `${a.lastName}${firstNamePart}`;
    })
    .join('; ');
};

const toBookHighlight = (book: Book): BookHighlight => {
  return {
    book: {
      id: hash(book.title),
      title: book.title,
      author: formatAuthor(book.author),
    },
    highlights: book.annotations
      .filter((entry) => entry.type === 'HIGHLIGHT' || entry.type === 'UNKNOWN')
      .map(
        (entry): Highlight => ({
          id: hash(entry.content),
          text: entry.content,
          note: entry.note,
          location: entry.location?.display,
          page: entry.page?.display,
          createdDate: entry.createdDate,
        })
      ),
  };
};

export const parseBooks = (file: string): BookHighlight[] => {
  const clippingsFileContent = fs.readFileSync(file, 'utf8');

  const parsedRows = readMyClippingsFile(clippingsFileContent);
  const books = groupToBooks(parsedRows);

  return books.map(toBookHighlight);
};
