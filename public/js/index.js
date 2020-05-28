let finalUsername = "";
const storiesDiv = document.getElementById("stories");

let recommendedFilter = false;

async function fetchStories() {

    const apiUrl = recommendedFilter ? "/api/stories/recommended" : "/api/stories";

    const latestJson = await fetch(apiUrl);
    const latest = await latestJson.json();

    renderStories(latest.data);

    storeStoriesCachedData(latest.data)
}

async function refreshStories() {
    fetchStories().catch(error => {
        const username = window.localStorage.getItem('username');
        showOfflineWarning();
        getOtherUserStories(username);
    });
}

window.onload = async () => {

    verifyLogin();

    document.getElementById("toggle-sort").addEventListener("click", async e => {
        e.preventDefault();
        recommendedFilter = !recommendedFilter;
        document.getElementById("toggle-sort").disabled = true;
        await refreshStories();
        document.getElementById("toggle-sort").disabled = false;
        document.getElementById("sort-text").innerHTML = `Sorting by ${recommendedFilter ? "recommended" : "latest"}`;
    });

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

    $(document).ready(function () {
         var socket = io();
         socket.on('new-story', function(data){
             var alertWindow = document.getElementById("alertWindow");
             console.log("HHHH")
             alertWindow.innerHTML = '<div id="alertWindow" class="alert alert-primary" role="alert"> New story from: '+data.from+' check it out by refreshing your page! </div>'

         });
     });

    refreshStories();

}