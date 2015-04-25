self.port.on("show", function(data) {
  document.getElementById("url").innerHTML = data.url;
  document.getElementById("status").innerHTML = data.status;
});

window.addEventListener('click', function(event) {
  var t = event.target;
  if (t.nodeName == 'A') {
    self.port.emit('sidebar');
  }
}, false);
