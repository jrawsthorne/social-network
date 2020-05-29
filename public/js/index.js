let finalUsername = "";
const storiesDiv = document.getElementById("stories");

let recommendedFilter = false;

// Fetches stories chronologically or by recoomendation determined by user
// Renders stories
// Stores in cache
async function fetchOtherUserStories() {
    const apiUrl = recommendedFilter ? "/api/stories/recommended" : "/api/stories";

    const latestJson = await fetch(apiUrl);
    const latest = await latestJson.json();

    renderStories(latest.data);

    storeStoriesCachedData(latest.data)
}

// Handles refreshing of stories
async function refreshOtherUserStories() {

    const username = window.localStorage.getItem('username');
    if (username) getOtherUserStories(username);

    try {
        await fetchOtherUserStories();
    } catch (e) {
        showOfflineWarning();
    }

}

window.onload = async () => {

    verifyLogin();

    // Toggles recommendation/chronologically filter
    document.getElementById("toggle-sort").addEventListener("click", async e => {
        e.preventDefault();
        recommendedFilter = !recommendedFilter;
        document.getElementById("toggle-sort").disabled = true;
        await refreshOtherUserStories();
        document.getElementById("toggle-sort").disabled = false;
        document.getElementById("sort-text").innerHTML = `Sorting by ${recommendedFilter ? "recommended" : "latest"}`;
    });

    // Handles logout
    document.querySelector("a#logout").addEventListener("click", async e => {
        e.preventDefault();
        window.localStorage.removeItem("username");
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) { }
        window.location = "/login";
    })

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js');
    }

    //check for support
    if ('indexedDB' in window) {
        initDatabase();
    } else {
        console.log('This browser doesn\'t support IndexedDB');
    }

    // Handles socket io, alerts the user to new posts
    let socket = io();
    socket.on('new-story', function (data) {
        let alertWindow = document.getElementById("alertWindow");
        alertWindow.innerHTML = '<div id="alertWindow" class="alert alert-primary" role="alert"> New story from: ' + data.from + '.<a onClick="location.reload()" href=""><b><u> Click here to check it out!</u></b></a></div>'

    });

    refreshOtherUserStories();
}