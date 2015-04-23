console.log("SCRIPT");
const icons = ["./good-16.png","./bad-16.png","./ugly-16.png"];
var currentId = 0;

document.addEventListener("mouseover", function(event) {
  var t = event.target;
  if(t.tagName=="A") {
    if(t.getElementsByClassName("getsec-icon").length==0) {
      var id = "getsec-icon-" + ++currentId;
      t.innerHTML += '<div class="getsec-icon" id="' + id + '"></div>';
      self.port.emit("validate", {
        url: t.getAttribute("href"),
        id: id
      });
      console.log("EMIT");
    }
  }
});

self.port.on("enhance", function(data) {
      console.log("ENHANCE: " + data.id);
      var tag = document.getElementById(data.id);
      tag.innerHTML += '<div class="getsec-icon-' + data.status + '"></div>';
});
