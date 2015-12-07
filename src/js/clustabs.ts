import * as angular from 'angular';
import * as kuromoji from 'kuromoji';

interface ITab {
  tab: chrome.tabs.Tab;
  favicon: string;
  text?: string;
}

function getAllTabs(): Promise<ITab[]> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      // List of promise for getting tab information.
      var ps = tabs.map(getTabInfo);
      Promise.all(ps).then((values: ITab[]) => {
        resolve(values);
      }).catch((e) => { reject(e); });
    });
  });
}

function getTabInfo(tab: chrome.tabs.Tab): Promise<ITab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, {method: 'getText'}, (response) => {
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

function buildTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  return new Promise((resolve, reject) => {
    kuromoji.builder({dicPath: "/dict/"})
      .build((err: Error, tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>) => {
        if (err) {
          reject(err);
        } else {
          resolve(tokenizer);
        }
      });
  });
}

class ClustabsController {
  static ID = 'ClustabsController';
  static $inject = ['$scope'];
  public tabs: ITab[];
  private tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

  constructor (
      private $scope: ng.IScope,
      private $q: ng.IQService
  ) {
    this.init();
  }

  init() {

    buildTokenizer().then((tokenizer) => {
      this.tokenizer = tokenizer;
      getAllTabs().then((response) => {
        this.tabs = response;
        this.$scope.$digest();

        // EXPERIMENT:
        this.tabs.forEach((tab) => {
          // 1. whole text: too long to complete
          // 2. title: fast but too little information...?
          // 3. h1, h2, h3...: haven't tried yet
          let tokens = tokenizer.tokenize(tab.tab.title);
          let nouns = tokens.filter((token) => token.pos === '名詞' && token.word_id !== 80)
                            .map((token) => token.surface_form);
          console.log('---');
          console.log(tab.tab.title);
          console.log(nouns);
        });

      }).catch((e) => {
        console.error(e);
      });
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
