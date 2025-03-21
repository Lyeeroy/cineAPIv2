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

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const importCode = params.get('import');
    const redirect = params.get('redirect') === 'true';

    if (importCode) {
      try {
        const data = JSON.parse(atob(importCode));
        this.urlList = data;
        this.saveData();
        if (redirect) {
          window.location.href = 'index.html';
        }
      } catch (e) {
        console.error('Failed to import automatically', e);
      }
    } else {
      this.urlList = this.loadData();
    }
  }

  saveData() {
    localStorage.setItem('urlList', JSON.stringify(this.urlList));
  }

  loadData(): string[] {
    const data = localStorage.getItem('urlList');
    return data ? JSON.parse(data) : [];
  }

  addUrl(value = '') {
    if (this.urlList.length >= this.maxUrls) return;
    this.urlList.push(value);
    this.saveData();
  }

  removeUrl(index: number) {
    this.urlList.splice(index, 1);
    this.saveData();
  }

  moveUrlUp(index: number) {
    if (index > 0) {
      const temp = this.urlList[index];
      this.urlList[index] = this.urlList[index - 1];
      this.urlList[index - 1] = temp;
      this.saveData();
    }
  }

  moveUrlDown(index: number) {
    if (index < this.urlList.length - 1) {
      const temp = this.urlList[index];
      this.urlList[index] = this.urlList[index + 1];
      this.urlList[index + 1] = temp;
      this.saveData();
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
      this.saveData();
      alert('Data imported successfully!');
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
}
