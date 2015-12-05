/// <reference path="../../typings/tsd.d.ts"/>
import * as angular from 'angular';

interface ITab {
  tab: chrome.tabs.Tab;
  favicon: string;
  text?: string;
}

function getAllTabs(): Promise<ITab[]> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, function(tabs: chrome.tabs.Tab[]) {
      // List of promise for getting tab information.
      var ps = tabs.map(getTabInfo);
      Promise.all(ps).then(function(values: ITab[]) {
        resolve(values);
      }).catch(function(e) { reject(e); });
    });
  });
}

function getTabInfo(tab: chrome.tabs.Tab): Promise<ITab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, {method: 'getText'}, function(response) {
      resolve({
        tab: tab,
        favicon: 'https://www.google.com/s2/favicons?domain=' + getHost(tab.url),
        text: response ? response.data : undefined
      });
    });
  });
}

function getHost(url: string): string {
  return url.replace(/^[^/]+:\/\/([^/]+)\/?.*/, '$1');
}

class ClustabsController {
  static ID = 'ClustabsController';
  static $inject = ['$scope'];
  public tabs: ITab[];

  constructor (
      private $scope: ng.IScope
  ) {
    this.init();
  }

  init() {
    getAllTabs().then((response) => {
      this.tabs = response;
      this.$scope.$digest();
    }).catch((e) => {
      console.error(e);
    });
  }

  select(tab: ITab) {
    chrome.tabs.update(tab.tab.id, {highlighted: true, active: true});
  }

  remove(index: number) {
    var target = this.tabs[index];
    chrome.tabs.remove(target.tab.id);
    this.tabs.splice(index, 1);
  }
}

class CompilePoviderConfig {
  static $inject = ['$compileProvider'];
  static aHref = /^\s*(https?|ftp|mailto|chrome-extension):/;

  constructor ($compileProvider: ng.ICompileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(CompilePoviderConfig.aHref);
  }
}

angular.module('clustabs', [])
    .controller(ClustabsController.ID, ClustabsController)
    .config(CompilePoviderConfig);
