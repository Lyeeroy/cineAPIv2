import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Tab {
  id: number;
  title: string;
  active: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [FormsModule, CommonModule],
})
export class HeaderComponent {
  isSidebarOpen = false;
  tabs: Tab[] = [];
  nextTabId = 1;

  // Dummy content for demonstration
  dummyTitles = [
    'Reacher S01E03',
    'Naruto: Shippuden S02E35',
    'Breaking Bad S05E14',
    'Stranger Things S04E08',
  ];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  addNewTab() {
    const newTab: Tab = {
      id: this.nextTabId++,
      title: this.getRandomTitle(),
      active: false,
    };

    // Deactivate all tabs before activating new one
    this.tabs.forEach((t) => (t.active = false));
    newTab.active = true;
    this.tabs.push(newTab);
  }

  closeTab(tabId: number) {
    this.tabs = this.tabs.filter((t) => t.id !== tabId);
    // If closing active tab, activate first tab
    if (this.tabs.length > 0 && !this.tabs.some((t) => t.active)) {
      this.tabs[0].active = true;
    }
  }

  setActiveTab(tabId: number) {
    this.tabs.forEach((t) => (t.active = t.id === tabId));
  }

  clearAllTabs() {
    this.tabs = [];
    this.nextTabId = 1;
  }

  private getRandomTitle(): string {
    return this.dummyTitles[
      Math.floor(Math.random() * this.dummyTitles.length)
    ];
  }
}
