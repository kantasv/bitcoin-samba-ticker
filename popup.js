// Listens the latest ltp from background.js
chrome.runtime.onMessage.addListener(
    function(request) {
        if (request.msg === "ltp-updated") {
            updateLTPOnPopup(request.data.ltp)
        }
    }
);

const updateLTPOnPopup=(ltp)=>{
    document.getElementById('ltp-text').innerText=ltp
}

const optOutInSoundNotification=()=>{
    alert('切り替え')
}