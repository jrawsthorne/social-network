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
    verifyLogin();
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

function renderStories(stories) {
    var sDiv = document.querySelector(".stories");

    sDiv.textContent = "";

    for (const story of stories) {
        const outer = document.createElement("div");
        outer.classList = "story container border";
        const by = document.createElement("small");
        by.innerHTML = `By <b>${story.author.username}</b> at ${new Date(story.createdAt)}`;
        const text = document.createElement("p");
        text.innerHTML = story.text;

        const photos = document.createElement("div");

        for (const photo of story.images) {
            const img = document.createElement("img");
            img.src = photo;
            img.width = 250;
            photos.appendChild(img);
        }   

        outer.appendChild(by);
        outer.appendChild(text);
        outer.appendChild(photos);

        sDiv.appendChild(outer);
    }
}

/**
 * Ensures that if the user is online and has a valid login credentials
 */
async function verifyLogin() {

    const storedUsername = window.localStorage.getItem("username");
    
    if (storedUsername) {
        document.getElementById("greeting").innerText = `Hello ${storedUsername}`;
    }

    // if client is offline unable to verify user status
    if (navigator.onLine) {

        let username;

        try {
            const res = await fetch("/api/auth/me", { headers: { "Content-type": "application/json" } });
            const json = await res.json();
            username = json.username;
        } catch (e) {
            console.log("Login Failed " + e)
        }

        if (!username) {
            window.localStorage.removeItem("username");
            window.location = "/login";
        } else {
            window.localStorage.setItem("username", username);
            document.getElementById("greeting").innerText = `Hello ${username}`;
        }

    } else {
        showOfflineWarning();
    }
}