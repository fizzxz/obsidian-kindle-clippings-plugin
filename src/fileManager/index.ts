import { MetadataCache, normalizePath, TAbstractFile, TFile, TFolder, Vault } from 'obsidian';

import type { Book, KindleFile, KindleFrontmatter } from '~/models';
import { mergeFrontmatter } from '~/utils';

import { authorFolderPath, bookFilePath, bookToFrontMatter, frontMatterToBook } from './mappers';

const SyncingStateKey = 'kindle-sync';

export default class FileManager {
  constructor(private vault: Vault, private metadataCache: MetadataCache) {}

  public async readFile(file: KindleFile): Promise<string> {
    return await this.vault.cachedRead(file.file);
  }

  public getKindleFile(book: Book): KindleFile | undefined {
    const allSyncedFiles = this.getKindleFiles();

    const kindleFile = allSyncedFiles.find((file) => file.frontmatter.bookId === book.id);

    return kindleFile == null ? undefined : { ...kindleFile, book };
  }

  public mapToKindleFile(fileOrFolder: TAbstractFile): KindleFile | undefined {
    if (fileOrFolder instanceof TFolder) {
      return undefined;
    }

    const file = fileOrFolder as TFile;

    const fileCache = this.metadataCache.getFileCache(file);

    // File cache can be undefined if this file was just created and not yet cached by Obsidian
    const kindleFrontmatter = fileCache?.frontmatter?.[SyncingStateKey] as KindleFrontmatter;

    if (kindleFrontmatter == null) {
      return undefined;
    }

    const book = frontMatterToBook(kindleFrontmatter);

    return { file, frontmatter: kindleFrontmatter, book };
  }

  public getKindleFiles(): KindleFile[] {
    return this.vault
      .getMarkdownFiles()
      .map((file) => this.mapToKindleFile(file))
      .filter((file) => file != null);
  }

  public async createFolder(
    book: Book,
  ): Promise<void> {
    const folderPath = this.generateFolderPath(book);
    try {
        await this.vault.createFolder(folderPath);
    } catch (error) {
      //handle an error that the authors folder already exists
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const errStr = `${error}`
      if(errStr.includes("Folder already exists."))
      {
        console.log(`folder already created (path="${folderPath})"`);
      } else{
        console.log(errStr)
        console.error("Unexpected error occured: "+errStr);
        throw error;
      }
    }
  }

  public async createFile(
    book: Book,
    content: string,
    highlightsCount: number
  ): Promise<void> {
    const filePath = this.generateUniqueFilePath(book);
    const frontmatterContent = this.generateBookContent(book, content, highlightsCount);

    try {
      await this.vault.create(filePath, frontmatterContent);
    } catch (error) {
      console.error(`Error writing new file (path="${filePath})"`);
      throw error;
    }
  }

  public async updateFile(
    kindleFile: KindleFile,
    remoteBook: Book,
    content: string,
    highlightsCount: number
  ): Promise<void> {
    const frontmatterContent = this.generateBookContent(remoteBook, content, highlightsCount);

    try {
      await this.vault.modify(kindleFile.file, frontmatterContent);
    } catch (error) {
      console.error(`Error modifying e file (path="${kindleFile.file.path})"`);
      throw error;
    }
  }

  /**
   * Generate book content by combining both book (a) book markdown and
   * (b) rendered book highlights
   */
  private generateBookContent(book: Book, content: string, highlightsCount: number): string {
    return mergeFrontmatter(content,
      bookToFrontMatter(book, highlightsCount)
    );
  }
  //TODO instead of creating a duplicate
  // check if it has the same contents
  // or if not add onto the bottom the new
  // clippings.
  private generateUniqueFilePath(book: Book): string {
    const filePath = bookFilePath(book);

    const isDuplicate = this.vault
      .getMarkdownFiles()
      .some((v) => v.path === normalizePath(filePath));

    if (isDuplicate) {
      const currentTime = new Date().getTime().toString();
      return filePath.replace('.md', `-${currentTime}.md`);
    }

    return filePath;
  }

  private generateFolderPath(book: Book): string {
    const folderPath = authorFolderPath(book);
    return folderPath;
  }
}
