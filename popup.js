// Fetches the latest ltp from bitFlyer Lightning API.

let request = new XMLHttpRequest();
request.open('GET', 'https://api.bitflyer.jp/v1/ticker?product_code=BTC_JPY', true);
request.responseType = 'json';
request.onload = function () {
    let data = this.response;
    updateLTPOnPopup(data.ltp)
}
request.send();



// Listens the latest ltp from background.js
chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.msg === "ltp-updated") {
            updateLTPOnPopup(request.data.ltp)
        }
    }
);

// Updates ltp on DOM.
const updateLTPOnPopup = (ltp) => {
    document.getElementById('ltp-text').innerText = ltp
}

// Sends message to background.js to toggle sound notificaton.
const toggleSoundNotification = () => {
    chrome.runtime.sendMessage({
        msg: "sound-notification-toggled",
        data: {
        }
    });
}

window.onload = () => {
    document.getElementById('toggleSoundNotificationButton').onclick = () => {
        toggleSoundNotification()
    }

}
