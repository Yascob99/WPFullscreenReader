
// If the script needs injecting
var inject = false;

// If the script got a response
var aResponse = false;

// On clicking the plugin button
chrome.browserAction.onClicked.addListener(function(tab) {

	// Using the active tab in the active window 
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	
		// Send a message to see if the script is already injected
		chrome.tabs.sendMessage(tabs[0].id, {greeting: "I greet you in the name of Yascob"}, function(response) {
	
			// Set aResponse to the returned boolean
			window.aResponse = response;
			
			// If it got a response
			if (response) {
					  
				// Print the returned message
				console.log(response.message)
				
				// Print that the javascript has already been injected
				console.log("Content Already injected");
				
				// Set the injection variable to false
				window.inject = false;
			}
			else {
			
				// Print that the javascript is going to be injected
				console.log("Injecting content");
				
				// Set the injection variable to true
				window.inject = true;
			}
		});
	});
	
	// Set count to default of 0
	var count = 0;
	
	// While there has been no response and has not been attempted 20 times
	while (!window.aResponse && count <= 20){
	
		// Increment the count
		count ++
		
		// Wait for a response for 0.1s 
		setTimeout(function(){
		
			// If the scripts need injecting 
			if(window.inject == true){
			
				// Reset the variables
				window.inject = false;
				window.aResponse = false;
				
				// Inject JQuery
				chrome.tabs.executeScript(null,{
						file: 'jquery.js',
				});
				
				// Inject viewport.js
				chrome.tabs.executeScript(null,{
						file: 'viewport.js',
				});
				
				// Inject the main fullscreen function
				chrome.tabs.executeScript(null,{
						file: 'fullscreen.js',
				});
			}
		}, 100);
	}
});
