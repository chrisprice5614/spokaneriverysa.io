fetch('/nav.html')
.then(res => res.text())
.then(text => {
    let oldelem = document.querySelector("script#nav_replace");
    let newelem = document.createElement("div");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem,oldelem);
})



//Checking if logged in



if(!sessionStorage.getItem("loggedIn"))
{
    var obj = {};
    let reqNav = new XMLHttpRequest();

    reqNav.onreadystatechange = () => {
    if (reqNav.readyState == XMLHttpRequest.DONE) {
        let preJson = JSON.parse(reqNav.responseText);
        let displayName = preJson.data.AccountInfo.TitleInfo.DisplayName;

        if(displayName!=undefined)
        {
            sessionStorage.setItem("displayName", displayName);
            sessionStorage.setItem("loggedIn", true);
            usernameReplace();
        }
    }
    };


    reqNav.open("POST", "https://3524C.playfabapi.com/Client/GetAccountInfo", true);
    reqNav.setRequestHeader("Content-Type", "application/json");
    reqNav.setRequestHeader("X-Authorization", sessionStorage.getItem("sessionTicket"));
    reqNav.send(JSON.stringify(obj));
}
else
{
    
    usernameReplace();
}

async function usernameReplace()
{
    await sleep(100);
    var container = document.querySelector("#username-replace");
    var html = `Hello, ${sessionStorage.getItem("displayName")}`;
    container.insertAdjacentHTML('beforeend', html);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }