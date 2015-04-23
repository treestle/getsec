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
  onClick: test_validate
});

function validate(url, callback) {
  var py_validate = child_process.spawn('/usr/bin/python' , ['/home/corrupted/Projects/firefox_ext/addon-sdk-1.17/dnssec_ext/data/bin/main.py', '-v', url]);
  py_validate.stdout.on('data', function (data) {
    console.log(data);
    callback(JSON.parse(data));
  });
}

function test_validate(state) {
    validate('test.com',console.log);
}
