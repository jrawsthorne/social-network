// import "./post.js";

async function sendAjaxQuery(url, data) {
    try {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const json = await res.json();
        console.log(json)
        // document.getElementById("results").innerHTML = JSON.stringify(json);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function onSubmit(url) {
    var formArray = $("form").serializeArray();
    var data = {};
    for (index in formArray) {
        data[formArray[index].name] = formArray[index].value;
    }
    // const data = JSON.stringify($(this).serializeArray());
    sendAjaxQuery(url, data);
    event.preventDefault();
}

// window.onload = function () {
//     document.querySelector("input[type='submit']").addEventListener("click", async () => {
//         // await sendAjaxQuery("/index");
//         await sleep(5000);
//         console.log("test");
//     });
// }

// async function sleep(ms) {
//     await new Promise(resolve => {
//         setTimeout(resolve, ms);
//     })
// }