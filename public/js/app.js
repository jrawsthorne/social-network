/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is not updating
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', function(e) {
    console.log("You are online");
    hideOfflineWarning();
}, false);

/**
 * Updates a banner above the navigation bar indicating the client is offline
 * @see Row Row indicating the client is offline
 */
function showOfflineWarning(){
    if (document.getElementById('offline')!=null) {
        document.getElementById('offline').style.display='block';
    }
}

/**
 * Remove a banner above the navigation bar
 * @see Row Row indicating the client is offline is removed
 */
function hideOfflineWarning(){
    if (document.getElementById('offline')!=null) {
        document.getElementById('offline').style.display='none';
    }
}