import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  placeholderTags = ['#type', '#id', '#season', '#episode'];
  placeholderRegex = /#type|#id|#season|#episode/g;
  maxUrls = 999;
  baseDomain = 'https://lyeeroy.github.io/CineAPI/';
  urlList: string[] = [];
  debugInfo: any[] = [];
  debugPanelVisible = false;
  docsVisible = false;
  importInput: string = '';
  exportFormat: string = 'export-code'; // Default export format
  activeTab: string = 'url-management';
  isDarkMode: boolean = false;

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const importCode = params.get('import');
    const redirect = params.get('redirect') === 'true';

    if (importCode) {
      try {
        const data = JSON.parse(atob(importCode));
        this.urlList = data;

        if (redirect) {
          window.location.href = 'index.html';
        }
      } catch (e) {
        console.error('Failed to import automatically', e);
      }
    } else {
      this.urlList = this.loadData();
    }

    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  saveData() {
    localStorage.setItem('urlList', JSON.stringify(this.urlList));
    this.showPopup('Data Saved!', 'Your URL list has been saved successfully.');
  }

  loadData(): string[] {
    const data = localStorage.getItem('urlList');
    return data ? JSON.parse(data) : [];
  }

  addUrl(value = '') {
    if (this.urlList.length >= this.maxUrls) return;
    this.urlList.push(value);
  }

  removeUrl(index: number) {
    this.urlList.splice(index, 1);
  }

  moveUrlUp(index: number) {
    if (index > 0) {
      const temp = this.urlList[index];
      this.urlList[index] = this.urlList[index - 1];
      this.urlList[index - 1] = temp;
    }
  }

  moveUrlDown(index: number) {
    if (index < this.urlList.length - 1) {
      const temp = this.urlList[index];
      this.urlList[index] = this.urlList[index + 1];
      this.urlList[index + 1] = temp;
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard');
    });
  }

  exportData(format: string) {
    const urlListData = btoa(JSON.stringify(this.urlList));
    let data: string = '';
    switch (format) {
      case 'export-code':
        data = urlListData;
        break;
      case 'export-url':
        data = `${this.baseDomain}apis.html?import=${urlListData}`;
        break;
      case 'export-url-redirect':
        data = `${this.baseDomain}apis.html?import=${urlListData}&redirect=true`;
        break;
      default:
        console.warn('Unknown export format:', format);
    }
    this.importInput = data; // Display the exported data in the textarea
  }

  importData(inputData: string) {
    try {
      const importData = inputData.includes(
        `${this.baseDomain}apis.html?import=`
      )
        ? inputData
            .split(`${this.baseDomain}apis.html?import=`)[1]
            .split('&')[0]
        : inputData;
      const data = JSON.parse(atob(importData));
      this.urlList = data;

      this.showPopup(
        'Data Imported!',
        'Your URL list has been imported successfully.'
      );
    } catch (e) {
      alert('Incorrect format');
    }
  }

  toggleDebugPanel() {
    this.debugPanelVisible = !this.debugPanelVisible;
    if (this.debugPanelVisible) {
      this.debugInfo = this.urlList.map((url, index) => {
        const placeholders = [...url.matchAll(this.placeholderRegex)].map(
          (match) => match[0]
        );
        const uniquePlaceholders = [...new Set(placeholders)];
        const missing = this.placeholderTags.filter(
          (tag) => !uniquePlaceholders.includes(tag)
        );
        const completeness = `${uniquePlaceholders.length}/4`;

        return {
          index,
          url,
          placeholders: uniquePlaceholders,
          completeness,
          missing,
          valid: uniquePlaceholders.length === this.placeholderTags.length,
        };
      });
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  setMode(mode: string) {
    this.isDarkMode = mode === 'dark';
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  closeSettings() {
    window.location.href = 'index.html';
  }

  showPopup(title: string, message: string) {
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div class="max-w-4xl mx-auto bg-gray-50 dark:bg-[#1a1a1a] dark:text-white border-t-[7px] border-green-500 text-gray-800 rounded-lg font-[sans-serif]" role="alert">
        <div class="px-8 py-6 max-w-4xl">
          <h4 class="font-bold text-lg mb-3">${title}</h4>
          <p class="text-sm">${message}</p>
        </div>
      </div>
    `;
    popup.classList.add(
      'fixed',
      'top-20',
      'left-1/2',
      'transform',
      '-translate-x-1/2',
      '-translate-y-10px'
    );
    document.body.appendChild(popup);
    setTimeout(() => {
      document.body.removeChild(popup);
    }, 1000);
  }
}
