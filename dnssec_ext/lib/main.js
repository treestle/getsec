var buttons = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var sidebars = require("sdk/ui/sidebar");
var pageMod = require("sdk/page-mod");
var child_process = require("sdk/system/child_process");
var status = 1;

const icons = {
  good: {
      "16": "./good-16.png",
      "32": "./good-32.png",
      "64": "./good-64.png"
    },
  bad: {
      "16": "./bad-16.png",
      "32": "./bad-32.png",
      "64": "./bad-64.png"
    },
  ugly: {
      "16": "./ugly-16.png",
      "32": "./ugly-32.png",
      "64": "./ugly-64.png"
    }
};

tabs.on('activate', onTabReady);
tabs.on('pageshow', onTabReady);

var button = buttons.ToggleButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: icons.good,
  onChange: handleClick
});

var panel = panels.Panel({
  contentURL: "./panel.html",
  onHide: handleHide,
  contentScriptFile: "./panel-script.js"
});

panel.on("show", function() {
  var data = {url: tabs.activeTab.url, status: status};
  panel.port.emit("show",data);
});

panel.port.on("sidebar", function() {
  panel.hide();
  sidebar.show();
});

var sidebar = sidebars.Sidebar({
  id: 'test-sidebar',
  title: 'Test Sidebar',
  url: "./sidebar.html"
});

var anchorMod = pageMod.PageMod({
  include: ['*'],
  contentScriptFile: "./anchor-mod.js",
  contentScriptWhen: "start",
  contentStyleFile: "./anchor-mod.css",
  onAttach: function(worker) {
    worker.port.on("validate", function(data) {
      console.log("RECEIVE: " + data.url);
      validate(data.url, function() {
        worker.port.emit("enhance", {
          id: data.id,
          status: status
        });
      });
    });
  }
});

function handleClick(state) {
  if(state.checked)
    panel.show({position: button});
}

function onTabReady(tab) {
  validate(tab.url, tab_ready_callback);
}

function tab_ready_callback(data) {
  var status = Math.floor(data["dnssec_status"]);
  console.log(data["dnssec_status"]);
  switch(status) {
    case 0:
      button.icon = icons.ugly;
      break;
    case 1:
      button.icon = icons.bad;
      break;
    case 2:
      button.icon = icons.good;
      break;
  }
}


function checkUrl(url) {
  console.log(url);
  return Math.floor((Math.random() * 3));
}

function validate(url, callback, args = {}) {
  var py_validate = child_process.spawn('/usr/bin/python' , ['/home/corrupted/Projects/firefox_ext/addon-sdk-1.17/dnssec_ext/data/bin/main.py', '-v', url]);
  py_validate.stdout.on('data', function (data) {
    console.log(data);
    callback(JSON.parse(data));
  });
}


function handleHide() {
  button.state('window', {checked: false});
}
