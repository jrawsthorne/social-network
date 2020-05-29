
window.onload = async () => {

    verifyLogin();

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

    document.getElementById("create-story").addEventListener("submit", async e => {
        e.preventDefault();

        const text = e.target.querySelector("#text").value;
        const username = window.localStorage.getItem("username");

        // Gather form data to submit via AJAX
        const formData = new FormData();
        const photos = document.querySelector('input[type="file"][multiple]');

        if (photos.files.length > 3) {
            alert("The number of photos is over the 3 photo limit");
        } else {

            formData.append("text", text);
            for (const file of photos.files) {
                formData.append("photos", file);
            }

            await fetch("/api/stories", { method: "POST", body: formData });

            // Handles socket io, alerts the user to new posts
            let socket = io();
            socket.emit('create-story', {
                name: username,
                text: e.target.querySelector("#text").value
            });
            refreshPersonalStories();

        }
    });

    refreshPersonalStories();

}

// Handles refreshing of personal stories
async function refreshPersonalStories() {
    const storedUsername = window.localStorage.getItem("username");
    if (username) getPersonalStories(storedUsername);

    try {
        await fetchPersonalStories();
    } catch (e) {
        showOfflineWarning();
    }
}

// Fetches personal stories chronologically
// Renders stories
// Stores in cache
async function fetchPersonalStories() {

    const storedUsername = window.localStorage.getItem("username");

    if (!storedUsername) {
        return;
    }

    const latestJson = await fetch(`/api/stories/${storedUsername}`);
    const latest = await latestJson.json();

    renderStories(latest.data);

    storeStoriesCachedData(latest.data);
}