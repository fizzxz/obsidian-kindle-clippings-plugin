import _ from 'lodash';
import { App, PluginSettingTab, Setting } from 'obsidian';
import { get } from 'svelte/store';

import type KindlePlugin from '~/.';
import type FileManager from '~/fileManager';
import { settingsStore } from '~/store';

import TemplateEditorModal from './templateEditorModal';

type AdapterFile = {
  type: 'folder' | 'file';
};

export class SettingsTab extends PluginSettingTab {
  constructor(app: App, plugin: KindlePlugin, private fileManager: FileManager) {
    super(app, plugin);
    this.app = app;
  }

  public display(): void {
    const { containerEl } = this;

    containerEl.empty();

    this.templatesEditor();
    this.highlightsFolder();
    this.highlightsByAuthorFolders();
  }

  private templatesEditor(): void {
    new Setting(this.containerEl)
      .setName('Templates')
      .setDesc('Manage and edit templates for file names and highlight note content')
      .addButton((button) => {
        button
          .setButtonText('Manage')
          .onClick(() => {
            new TemplateEditorModal(this.app).show();
          });
      });
  }

  private highlightsByAuthorFolders(): void {
    new Setting(this.containerEl)
    .setName('Seperate clipping by authors')
    .setDesc('Seperate all of your clipping and highlight notes by their corresponding author.')
    .addToggle(toggle => {
      toggle
      .onChange((value) => {
        settingsStore.actions.setHightlightsByAuthorFolder(value)
        })
        return toggle.setValue(get(settingsStore).highlightNotesByAuthorFolders).onChange((value)=>{
          settingsStore.actions.setHightlightsByAuthorFolder(value);
        });
    });
}

  private highlightsFolder(): void {
    new Setting(this.containerEl)
      .setName('Highlights folder location')
      .setDesc('Vault folder to use for writing book highlight notes')
      .addDropdown((dropdown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        const files = (this.app.vault.adapter as any).files as AdapterFile[];
        const folders = _.pickBy(files, (val) => {
          return val.type === 'folder';
        });

        Object.keys(folders).forEach((val) => {
          dropdown.addOption(val, val);
        });
        return dropdown.setValue(get(settingsStore).highlightsFolder).onChange((value) => {
          settingsStore.actions.setHighlightsFolder(value);
        });
      });
  }

}
