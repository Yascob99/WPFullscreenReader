function add_style(style, sid){
  var css = style,
  head = document.head || document.getElementsByTagName('head')[0],
  style = document.createElement('style');
  style.id = sid
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
}

function save_options() {
  var overBG  = document.getElementById('overBG').checked;
  var bgColor = document.getElementById('overBGcolor').value;
  console.log(bgColor)
  var overText  = document.getElementById('overText').checked;
  var textColor = document.getElementById('overTextColor').value;
  var initPage = document.getElementById('initPage').checked;
  var hideComments = document.getElementById('hideComments').checked;
  var scroll = !document.getElementById('noScrollMemory').checked;
  var reload = document.getElementById('reloadPages').checked;
  chrome.storage.sync.set({
    isBGO: overBG,
    BGOcolor: bgColor,
    isTO: overText,
    TOcolor: textColor,
    isGoToInitPage: initPage,
    hideCommentSection: hideComments,
    doScroll: scroll,
    doReload: reload
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
chrome.storage.sync.get({
    isBGO: false,
    BGOcolor: "#000000",
    isTO: false,
    TOcolor: "#000000",
    isGoToInitPage: false,
    hideCommentSection: false,
    doScroll: true,
    doReload: false
  }, function(items) {
  	console.log(items)
    document.getElementById('overBG').checked = items.isBGO;
    document.getElementById('overBGcolor').value = items.BGOcolor;
    document.getElementById('overText').checked = items.isTO;
    document.getElementById('overTextColor').value = items.TOcolor;
    document.getElementById('initPage').checked = items.isGoToInitPage;
    document.getElementById('hideComments').checked = items.hideCommentSection;
    document.getElementById('noScrollMemory').checked = !items.doScroll;
    document.getElementById('reloadPages').checked = items.doReload;
    add_style("html { background-color: " + items.BGOcolor + "; }", "BG");
    add_style("#Text { color: " + items.TOcolor + "; }", "Text");
  });

}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
var text = $('#Text');
    html = $('html');
$('#overBGcolor').on('change', function() {
        html.css("background-color", this.value);
});
$('#overTextColor').on('change', function() {
        text.css("color", this.value);
});
