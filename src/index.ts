import { Plugin } from 'obsidian';

import SyncModal from '~/components/syncModal';
import { ee } from '~/eventEmitter';
import FileManager from '~/fileManager';
import { registerNotifications } from '~/notifications';
import { SettingsTab } from '~/settings';
import { initializeStores } from '~/store';
import { SyncClippings, SyncManager } from '~/sync';


export default class KindlePlugin extends Plugin {
  private fileManager!: FileManager;
  private syncClippings!: SyncClippings;

  public async onload(): Promise<void> {
    console.log('Kindle Clippings plugin: loading plugin', new Date().toLocaleString());

    this.fileManager = new FileManager(this.app.vault, this.app.metadataCache);
    const syncManager = new SyncManager(this.fileManager);

    await initializeStores(this, this.fileManager);

    this.syncClippings = new SyncClippings(syncManager);

    this.addRibbonIcon('scissors', 'Sync your Kindle clippings', async () => {
      await this.showSyncModal();
    });

    this.addCommand({
      id: 'kindle-sync',
      name: 'Sync Clippings',
      callback: async () => {
        await this.showSyncModal();
      },
    });

    this.addSettingTab(new SettingsTab(this.app, this, this.fileManager));

    registerNotifications();
    this.registerEvents();

  }

  private registerEvents(): void {
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        const kindleFile = this.fileManager.mapToKindleFile(file);
        if (kindleFile == null) {
          return;
        }

      })
    );

    this.app.workspace.onLayoutReady(() => {
      ee.emit('obsidianReady');
    });
  }

  private async showSyncModal(): Promise<void> {
    await new SyncModal(this.app, {
      // onOnlineSync: () => this.startAmazonSync(),
      onMyClippingsSync: () => this.syncClippings.startSync(),
    }).show();
  }

  public onunload(): void {
    ee.removeAllListeners();
    console.log('Kindle Clippings plugin: unloading plugin', new Date().toLocaleString());
  }
}
