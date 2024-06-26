import { App, Modal } from 'obsidian';

import type { SyncMode } from '~/models';
import { settingsStore } from '~/store';

import { store, SyncModalState } from './store';
import SyncModalContent from './SyncModalContent.svelte';

const SyncModalTitle: Record<SyncModalState['status'], string> = {
  'upgrade-warning': 'Breaking change notice',
  'first-time': '',
  idle: 'Your Kindle Clippings',
  'sync:fetching-books': 'Syncing data...',
  'sync:login': 'Syncing data...',
  'sync:syncing': 'Syncing data...',
  'choose-sync-method': 'Sync using the "My Clipping.txt" file'
};

type SyncModalProps = {
  onMyClippingsSync: () => void;
};

export default class SyncModal extends Modal {
  private modalContent: SyncModalContent;

  constructor(app: App, private props: SyncModalProps) {
    super(app);
  }

  public async show(): Promise<void> {
    // TODO: Remove after proliferation of v1.0.0
    const isLegacy = await settingsStore.isLegacy();
    const initialState: SyncModalState['status'] = isLegacy ? 'upgrade-warning' : 'idle';
    store.update((state) => ({ ...state, status: initialState }));

    this.modalContent = new SyncModalContent({
      target: this.contentEl,
      props: {
        onDone: () => {
          this.close();
        },
        onClick: (mode: SyncMode) => {
          if (mode === 'my-clippings'){
            this.props.onMyClippingsSync();
          }
        },
        onUpgrade: async () => {
          await settingsStore.actions.upgradeStoreState();
          store.update((state) => ({ ...state, status: 'idle' }));
        },
      },
    });

    store.subscribe((state) => {
      this.titleEl.innerText = SyncModalTitle[state.status];
    });

    this.open();
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
  }
}
