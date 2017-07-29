
// Print the fact that the script has been injected
console.log("Fullscreen Script Injected!");

// Set the defaults
var fsid = "InjectedFullscreenCSS";
var fsTag = "#InjectedFullscreenCSS";
var BGModID = "InjectedBackgroundCSS";
var BGMODTag = "#InjectedBackgroundCSS";
var css = "fullscreen.css";
var wid = "WPFSRwrap";
var wTag = "#WPFSRwrap";
var oldurl = window.location.href;
var url = oldurl;
var element = selectElement();
var scrollPosElement = null;
var hideCS = "#hideCommentSection";
var BGOver = "#BGcolorOverride";
var TOver = "#TextcolorOverride";

// Allow only these elements
var acceptedNodes = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "img", "a", "span", "hr", "ol", "ul", "li", "tr", "table"];


$.fn.exists = function () {

	// If the element exists
	return this.length !== 0;
};

$.fn.findFirst = function(toFind){
	
	// Find the first child of the element
	return $(this.find(toFind + ":first"));
};

$.fn.inView = function(){


    el = this[0];

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $(window).height() &&
        rect.right <= $(window).width()
    );
};

function onVisibilityChange(el, callback) {
    var old_visible;
    return function () {
        var visible = el.inView();
        if (visible != old_visible) {
            old_visible = visible;
            if (typeof callback == 'function') {
                callback();
            }
        }
    };
}

$.fn.findPInView = function(){

	// Find the first child paragraph in view
    return  $(this.find("p:in-viewport:first"));
};

function loadSettings() {

	chrome.storage.sync.get({ isBGO: false, BGOcolor: "#000000", isTO: false, TOcolor: "#000000", isGoToInitPage: false, hideCommentSection: false, doReload: false }, function(items) {
	
        // Write settings to variables

        // Is Background Override on
        window.isBGO = items.isBGO;

        // The Background Override color
        window.BGOcolor = items.BGOcolor;

        // Is Text Override on
        window.isTO = items.isTO;

        // The Text Override color
        window.TOcolor = items.TOcolor;

        // Whether to go back to the initial page when exiting fullscreen
        window.isGoToInitPage = items.isGoToInitPage;

        // Hide the comment section of the page
        window.hideCommentSection = items.hideCommentSection;

        // Reload on going to new page
        window.doReload = items.doReload;
	
	});
}

// Check to make sure that this browser allows fullscreen
function fullscreenEnabled(){ return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;}

// Check if the browser is currently in fullscreen mode
function isFullscreen(){
	if(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement){
		return true;
	}
	return false;
}

// Get a hook reserved for plugins
function getHook(){
	var hook = document.getElementById("WPFSRhook");
	if (hook != null){
      return $( hook.content )
	}
  return null;
}

// Change an RGB color value into a Hex color value
function hexc(colorval) {
	var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	delete(parts[0]);
	for (var i = 1; i <= 3; ++i) {
		parts[i] = parseInt(parts[i]).toString(16);
		if (parts[i].length == 1) parts[i] = '0' + parts[i];
	}
	return '#' + parts.join('');
}

// Get the background color of the element, or, if it has no background color, the background color of the closest ancestor with a background colour
function get_background_color(elem) {

	// Get the element's background colour
	var real = elem.css("background-color");
	
	// Set defaults
	var none = 'rgba(0, 0, 0, 0)';
	var count = 0;
	var parentTag = elem.prop("tagName")
	
	// While the background colour is unknown and this is not the 200th ancestor
	while (real === none && count < 200) {
	
		// Check the element's direct parent
		elem = elem.parent()
		
		// Get the Tag type of the parent
		parentTag = elem.prop("tagName")
		
		// If the Tag type does not exist, set the count to 200 so it auto-exits
		if (parentTag == null){
			count = 200
		}
		
		// Else, get the element's background colour (if it has not background colour, it continues to backtrack) and increment the count
		else{
			real = elem.css("background-color");
			count += 1
		}
	}
	
	// If after backtracking a valid colour was found, convert it to hex
	try{
		real = hexc(real)
	}
	
	// Else, log the error to console
	catch(err){
		if (err.name != "TypeError"){
			console.log(err)
		}
	}
	
	// If the count is 200 or higher, set the background colour to white
	if (count >= 200){
		real = "#ffffff"
	}
	
	// Return the background colour
	return real
}

// add a style to the css
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

// Select the element that will make it go fullscreen. 
// TODO: Add a heuristic process for determining which ones should be checked first and if multiple are valid, which should be used. Possibly based on blogger and wordpress themes (plus wikis, especially mediawikis)
function selectElement(){

	var type_main = $( ".main-content");
	var type_page = $( ".type-page" );
	var type_post = $( ".type-post" );
	var post = $( ".post" );
	var main = $( "#main" );
	var content = $( "#content" );
	var type_blog = $(".blog-posts");
    var chapter_content = $(".chapter-body");
	
	// If it's of type main, and type main is not empty
	if (type_main.length !== 0 && type_main.text() != ""){
		console.log(type_main);
		return type_main;
	}
	
	// If it's of type post, and type post is not empty
	else if (type_post.length !== 0 && type_post.text() != ""){
		console.log(type_post.parent())
		return type_post;
	}
	
	// If it's a post, and the post is not empty
	else if (post.length !== 0 && post.text() != ""){
		console.log(post)
		return post;
	}
	
	// If it's of type page, and type page is not empty
	else if (type_page.length !== 0 && type_page.text() != ""){
		console.log(type_page.parent())
		return type_page;
	}
	
	// If it's content, and the content is not empty
	else if (content.length !== 0 && content.text() != ""){
		console.log(content)
		return content;
	}
	
	// If it's a main, and the main is not empty
	else if (main.length !== 0 && main.text() != ""){
		console.log(main)
		return main;
	}
	
	// If it's of type blog, and type blog is not empty
	else if (type_blog.length !== 0 && type_blog.text() != "" ){
		console.log(type_blog)
		return type_blog;
	}
    
    // If it's a chapter content, and chapter content is not empty
    else if (chapter_content.length !== 0 && chapter_content.text() != "" ){
        console.log(chapter_content)
        return chapter_content;
    }
	
	// Else, return null
	else{
		return null;
	}
}

// Make the element go fullscreen
function goFullscreen(el){
	
	// If the element actually exists
	if (el != null){
        
        // If it's of type post or type page, use it's parent element instead
        if (el.selector == ".type-post" || el.selector == ".type-page"){
            el = el.parent()
        }
        
        if (el != null){
	
            // Find the head of the document
            var head = document.head;

            // Create a stylesheet
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            var BGcss = document.getElementById(BGModID)

            // Wrap the element in a custom wrapper for easy css manipulation
            el.wrap("<div id='WPFSRwrap'></div>");

            // Put a "top" element inside the custom wrapper, at the top
            $('#WPFSRwrap').prepend("<span id='WPFSRtop'></span>")

            // Set fullscreenWrapper to the #WPFSRwrap element
            var fullscreenWrapper = document.getElementById(window.wid);

            // If the style sheet has yet to be injected
            if (document.getElementById(fsid) == null){

                // Set the first scroll element to the first paragraph in view
                window.scrollPosElement = $('#WPFSRwrap').findPInView();

                // Make the element fullscreen
                fullscreenWrapper.webkitRequestFullScreen();

                // Add the custom inline styling
                add_style("#WPFSRwrap { background-color: " + get_background_color(el) + "!important; }", BGModID);
                link.id = fsid;
                link.href = chrome.extension.getURL(css);

                // Add the custom stylesheet
                head.appendChild(link);
            }
        }
        // Return the fact that there was no valid element to choose from
        else {
            console.log("Invalid Element")
        }
	}
	// Return the fact that there was no valid element to choose from
	else {
		console.log("Invalid Element")
	}
};

// Stay fullscreen across pages
function stayFullscreen(el){

	// If the page is currently fullscreen
	if (isFullscreen()){
	
		// On clicking of a link
		$("a").click( function(){
		
			// The anchor element = the current link
			var aElement = this
			
			// Get the url of the link
			var url = aElement.href
			
			// Save the url as a global variable
			window.url = url;
			var data = "";
			
			// split the link into extraneous data and the link if there is extraneous data
			if (url.indexOf("?") > -1){
				var spliturl = url.split("?")
				url = spliturl[0]
				data = spliturl[1]
			}
			
			// If it's not an internal link
			if (url.indexOf("#") == -1 && data.indexOf("#") == -1){
			
				// Get the current site name
				var sitename = window.location.hostname
				
				// if it's on the same subdomain
				if (url.indexOf(sitename) > -1){
				
					// If the page is still fullscreen
					if (isFullscreen()){
					
						// If there was no extraneous data
						if (data == ""){
						
							// Retrieve the data from the website
							$.get(url).then(function(data) {
								
								// If the current page's selector is of type post or type page, use it's parent element instead
								if (el.selector == ".type-post" || el.selector == ".type-page"){
									var nextPage = $(data).find( el.selector ).parent();
								}
								
								// Else, get data on the next page based on the current selector
								else{
									var nextPage = $(data).find( el.selector );
								}
								
								// Get the wrapper element
								var wrap = document.getElementById(window.wid)
								
								// If data was actually returned from the link
								if (nextPage.exists()){
									
									// Change the data in the wrapper to that of the next page
									wrap.innerHTML = $("<div />").append(nextPage.clone()).html();
									$('#WPFSRwrap').prepend("<span id='WPFSRtop'></span>")
									
									// Recursively operate on itself
									stayFullscreen( $(el.selector) )
									
									// Reset view to the top of the page
									window.location.hash = '#WPFSRtop';
									
									// Reset the hash to blank
									window.location.hash = '';
									
									// if not in incognito, add the page to the history
									if (!chrome.extension.inIncognitoContext){
										if (window.url != window.oldurl){
											window.history.pushState("","",window.url)
										}
									}
								}
								
								// Else, print out that a next page could not be found
								else {
									console.log("Next page could not be found, or something stopped the function from getting data")
								}
							});
						}
						
						// If there is extraneous data
						else{
						
							// Retrieve the data from the website
							$.get(url, data).then(function(hdata) {
								var div = $("<div />").html(hdata);
							
								// If the current page's selector is of type post or type page, use it's parent element instead
								if (el.selector == ".type-post" || el.selector == ".type-page"){
									var nextPage = div.find( el.selector ).parent();
								}
							
								// Else, get data on the next page based on the current selector
								else{
									var nextPage = div.find( el.selector );
								}
							
								// Get the wrapper element
								var wrap = document.getElementById(window.wid)
							
								// If data was actually returned from the link
								if (nextPage.exists()){
							
									// Change the data in the wrapper to that of the next page
									wrap.innerHTML = $("<div />").append(nextPage.clone()).html();
									$('#WPFSRwrap').prepend("<span id='WPFSRtop'></span>")
								
									// Recursively operate on itself
									stayFullscreen( $(el.selector) )
								
									// Reset the hash to blank
									window.location.hash = '#WPFSRtop';
									window.location.hash = '';
								
									// if not in incognito, add the page to the history
									if (!chrome.extension.inIncognitoContext){
										if (window.url != window.oldurl){
											window.history.pushState("","",window.url)
										}
									}
								}
							});
						}
						
						// Prevents the default behaviour of the anchor tag
						event.preventDefault();
					}
				}
			}
		});

	}
}

// When it either goes fullscreen or exits fullscreen
document.addEventListener("webkitfullscreenchange", function(){


	// If the plugin is active and it found something to make fullscreen
	if (window.element != null){
	
		loadSettings()
	
		// Get elements
		var fscss = $(window.fsTag);
		var BGcss = $(window.BGModTag);
		var wrap = $(window.wTag);
		
		// If it has just exited fullscreen
		if (!isFullscreen()){
		
			// Get rid of the fullscreen reader elements
			$( '#WPFSRtop' ).remove()
			fscss.remove();
			BGcss.remove();
			
			// If the wrapper exists, unwrap the data
			if (wrap.exists()){
				console.log(wrap.children().first())
				wrap.children().first().unwrap()
			}
			
			// if do reload page on exiting fullscreen
			if (window.doReload){
			
				// if is set to go to the initial page
				if (window.isGoToInitPage){
					console.log(window.oldurl);
					location.reload();
				}
			
				// if not set to go to the initial page and the page has changed
				else {
					if (window.url != window.oldurl){
						window.location.replace(window.url);
					}
				}
			}
		
			/*else{
				if (!chrome.extension.inIncognitoContext){
					if (window.url != window.oldurl){
						window.history.pushState("","",window.url)
					}
				}
			}*/
    	}
	
		var x = 0
	
		// Finds the highest possible node of accepted types on the screen and sets it as the default scroll position
		while (!window.scrollPosElement.exists() && x < window.acceptedNodes.length ){
			window.scrollPosElement = $('#WPFSRwrap').findFirst(window.acceptedNodes[x])
			x++
		}
	
		// Scroll to that position
		if (x < acceptedNodes.length){
			console.log(window.scrollPosElement)
			window.scrollPosElement[0].scrollIntoView( true );
		}
	
		// Could not find anything to scroll to
		else{
			console.log("Sorry, could not find anything. What type of page are you looking at?")
		}
	
		// If using a background override and no background override currently exists
		if (window.isBGO && !$( window.BGover ).exists()){
	
				// Adds the background override
				add_style(" #WPFSRwrap"  +  " { background-color: " + window.BGOcolor + " !important; }\n\n #WPFSRwrap *"  +  " { background-color: " + window.BGOcolor + " !important; }", "BGcolorOverride");
		}
	
		// If no longer fullscreen, get rid of the background override
		else{
			if (!isFullscreen()){
                if ($(window.BGover).exists()){
				    window.BGover.remove();
                }
			}
		}
	
		// If using a text override and no text override currently exists
		if (window.isTO && ! $( window.Tover ).exists()){
			add_style(" *" + " { color: " + window.TOcolor + " !important; }", "TextcolorOverride");
		}
	
		// If no longer fullscreen, get rid of the text override
		else{
			if (!isFullscreen()){
                if ($(window.Tover).exists()){
					$( window.Tover ).remove();
                }
			}
		}
	
		// If using a comment section hider and no comment section hider currently exists
		if (window.hideCommentSection && ! $( window.hideCS ).exists()){
			add_style(" #comments, #disqus_thread" + " { display: none !important; }", "hideCommentSection");
		}
	
		// If no longer fullscreen, get rid of the comment section hider
		else{
			if (!isFullscreen()){
                if ($(window.hidCS).exists()){
					window.hideCS.remove();
                }
			}
		}
	
        if (window.scrollPosElement != null) {

            /*var handler = onVisibilityChange(window.scrollPosElement, function() {
                
                var next = window.scrollPosElement.next()
                
                while (! next.inView()) {
                    next = window.scrollPosElement.next()
                }
                
                window.scrollPosElement = next
                
            });*/

            //$(window).on('DOMContentLoaded load resize scroll', handler); 
        }
	}
});

// Handshake with injector
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.greeting == "I greet you in the name of Yascob"){
	  sendResponse({message: "Greetings overlord"});
		var fullscreen = isFullscreen();
		
		// exits fullscreen if button is pressed while fullscreen
		if (fullscreen){
			document.webkitExitFullscreen()
		}
		
		// enters fullscreen if button is pressed while not fullscreen
		else{
			goFullscreen(window.element)
		}
	}
});

// If not fullscreen, enter fullscreen on first run of script
if (!isFullscreen()){
	goFullscreen(window.element)
	stayFullscreen(window.element)
	console.log("Fullscreen Script Executed")
}

// BGO on script first run.
chrome.storage.sync.get("isBGO", function(items) {
	var isBGO = items.isBGO
	if (isBGO){
		chrome.storage.sync.get("BGOcolor", function(items) {
			var BGOcolor = items.BGOcolor;
			add_style(" #WPFSRwrap"  +  " { background-color: " + BGOcolor + " !important; }\n\n #WPFSRwrap *"  +  " { background-color: " + BGOcolor + " !important; }", "BGcolorOverride");
		});
	}
});
