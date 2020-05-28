
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

        const formData = new FormData();
        const photos = document.querySelector('input[type="file"][multiple]');

        console.log(photos.files);

        if (photos.files.length > 3) {
            alert("The number of files is over the 3 file limit");
        } else {

            formData.append("text", text);
            for (const file of photos.files) {
                formData.append("photos", file);
            }

            await fetch("/api/stories", { method: "POST", body: formData });
            var socket = io();
            socket.emit('create-story', {
                name: username,
                text: e.target.querySelector("#text").value
            });
            refreshStories();

        }
    });

    refreshStories();

}

async function refreshStories() {
    fetchStories().catch(error => {
        const storedUsername = window.localStorage.getItem("username");
        getPersonalStories(storedUsername);
    });
}

async function fetchStories() {

    const storedUsername = window.localStorage.getItem("username");

    if (!storedUsername) {
        return;
    }

    const latestJson = await fetch(`/api/stories/${storedUsername}`);
    const latest = await latestJson.json();

    renderStories(latest.data);

    storeStoriesCachedData(latest.data);
}