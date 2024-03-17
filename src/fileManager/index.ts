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
      // If the input is a folder, we need to check if it contains files with the required frontmatter
      const filesInFolder = fileOrFolder.children as TFile[];
      for (const file of filesInFolder) {
        const kindleFrontMatter = this.findKindleFrontMatter(file);
        if(kindleFrontMatter==null){
          break
        }
        return kindleFrontMatter
      }
      // If none of the files in the folder have the required frontmatter, return undefined
      return undefined;
    }
    const file = fileOrFolder as TFile;
    const kindleFrontMatter = this.findKindleFrontMatter(file);
    if(kindleFrontMatter==null){
      return undefined
    }
    return kindleFrontMatter
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
      // disable eslint to allow error as string
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const errStr = `${error}`
      //catch error for folders that have already been created
      // of clippings that have already been processed
      if (errStr.includes("Folder already exists.")) {
      } else {
        console.log(errStr)
        console.error("Unexpected error occured: " + errStr);
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

  private findKindleFrontMatter(file: TFile): KindleFile | undefined {
    const fileCache = this.metadataCache.getFileCache(file);

    // File cache can be undefined if this file was just created and not yet cached by Obsidian
    const kindleFrontmatter = fileCache?.frontmatter as unknown as KindleFrontmatter;

    if (kindleFrontmatter != null) {
      const book = frontMatterToBook(kindleFrontmatter);
      return { file, frontmatter: kindleFrontmatter, book };
    }else {
      return undefined
    }
  }
}
