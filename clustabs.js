// clustabs.js

function getAllTabs() {
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({}, function(tabs) {
      // List of promise for getting tab information.
      var ps = tabs.map(function(tab) { return getTabInfo(tab); });
      Promise.all(ps).then(function(values) {
        resolve(values);
      }).catch(function(e) { reject(e); });
    });
  });
}

function getTabInfo(tab) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tab.id, {method: 'getText'}, function(response) {
      resolve({
        tab: tab,
        favicon: 'https://www.google.com/s2/favicons?domain=' + getHost(tab.url),
        text: response ? response.data : undefined
      });
    });
  });
}

function getHost(url) {
  return url.replace(/^[^/]+:\/\/([^/]+)\/?.*/, '$1');
}

angular.module('clustabs', [])
    .controller('ClustabsController', ['$scope', function($scope) {
      var clustabs = this;

      clustabs.tabs = [];

      getAllTabs().then(function(response) {
        clustabs.tabs = response;
        $scope.$digest();
      }).catch(function(e) {
        console.error(e);
      });

      clustabs.select = function(tab) {
        chrome.tabs.update(tab.tab.id, {highlighted: true, active: true});
      };

      clustabs.remove = function(index) {
        var target = clustabs.tabs[index];
        chrome.tabs.remove(target.tab.id);
        clustabs.tabs.splice(index, 1);
      };

    }])
    .config(['$compileProvider', function($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome):|data:image\/)/);
    }]);
