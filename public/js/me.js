
window.onload = async () => {
    const storedUsername = window.localStorage.getItem("username");

    document.querySelector("a#logout").addEventListener("click", async e => {
        e.preventDefault();
        window.localStorage.removeItem("username");
        try {
            await fetch("/logout", { method: "POST" });
        } catch (e) { }
        window.location = "/login";
    })

    login();
    $(document).ready(function() {
        var socket = io();
        $('#createstory').submit(function(e){
            e.preventDefault(); // prevents page reloading
            socket.emit('create-story', {
                name: storedUsername,
                text: $('#text').val()
            });
            $('#text').val('');
            return false;
        });
    });
    async function login() {
        const storedUsername = window.localStorage.getItem("username");
    
        if (storedUsername) {
            document.getElementById("greeting").innerText = `Hello ${storedUsername}`;
        }
    
        let username;
    
        try {
            const res = await fetch("/users/me", { headers: { "Content-type": "application/json" } });
            const json = await res.json();
            username = json.username;
        } catch (e) {
    
        }
    
        if (!username) {
            window.localStorage.removeItem("username");
            window.location = "/login";
        } else {
            window.localStorage.setItem("username", username);
            document.getElementById("greeting").innerText = `Hello ${username}`;
        }
    
    }
}
