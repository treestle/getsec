var buttons = require('sdk/ui/button/action');
var child_process = require("sdk/system/child_process");
var tabs = require("sdk/tabs");
var url = require("sdk/net/url");
const fileIO = require("sdk/io/file");
var data = require('sdk/self').data;

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  var ls = child_process.spawn('/usr/bin/python' , ['/home/corrupted/Projects/firefox_ext/addon-sdk-1.17/dnssec_ext/data/bin/test.py']);
  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  ls.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
}
