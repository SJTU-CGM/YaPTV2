"use strict";

document.addEventListener("DOMContentLoaded", function(){
  function whiteout(node) {
    let ls = [];
    for (let child of node.childNodes) {
      if (child.nodeName == "#text" &&
          child.nodeValue.trim().length == 0) {
        ls.push(child);
      } else {
        whiteout(child);
      }
    }
    for (var child of ls) {
      node.removeChild(child);
    }
  }
  whiteout(document);
});
