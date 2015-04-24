console.log("SCRIPT");
const icons = [
  document.createElement("img"),
  document.createElement("img"),
  document.createElement("img")
];
for(var i=0; i<icons.length; i++) {
  icons[i].src = self.options.iconsUrls[i];
}
var currentId = 0;

document.addEventListener("mouseover", function(event) {
  var t = event.target;
  if(t.tagName=="A") {
    if(t.getElementsByClassName("getsec-icon").length==0) {
      var id = "getsec-icon-" + ++currentId;
      t.innerHTML += '<div class="getsec-icon" id="' + id + '"></div>';
      url = t.getAttribute("href")

      self.port.emit("validate", {
        url: url,
        id: id
      });
      console.log("EMIT");
    }
  }
});

self.port.on("enhance", function(data) {
      console.log("ENHANCE: " + data.id);
      var tag = document.getElementById(data.id);
      tag.parentElement.onclick = function(event) {
        if(data.status == 0) {
          event.preventDefault();
          self.port.emit("redirect", {
            origin: document.URL,
            destination: tag.parentElement.href
          });
        }
      };
      tag.appendChild(icons[data.status]);
});
