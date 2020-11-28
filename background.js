
'use strict';
let currentPrice = null
let previousPrice = null
// Stores an absolute value of the price changes (previous -> current)
let absPriceDiff = 0

// Loads audio files
const sound_samba = new Audio('./audio/samba.mp3');
/*
Credit
  Author: Takashi Kobayashi/小林 卓史/コバヤシ タカシ）
  Author nickname：こばっと／Kobat
  Sound profile: https://dova-s.jp/bgm/play11477.html
  Autor's profile: https://www.kobat-music.com/
*/
const sound_down = new Audio('./audio/non-samba.mp3');

/*
Credit
  Author: Notzan ACT
  Sound profile: https://dova-s.jp/bgm/play11949.html
  Autor's profile: https://dova-s.jp/_contents/author/profile362.html
*/

// Reads BTC price changes based on its arguments.
const readPrice = (changeType, absPriceDiff) => {
    let synthes = new SpeechSynthesisUtterance(`${changeType}${absPriceDiff}円なり`)
    synthes.volume = 4
    synthes.onend = () => { if (changeType == 'プラス') { sound_samba.play() } else { sound_down.play() } }
    speechSynthesis.speak(
        synthes
    );
}

// Sets sound notification OFF by default
let isSoundNotificationOn = false

// Sets icon bage to 'OFF' by default
chrome.browserAction.setBadgeText({ text: 'OFF' })
chrome.browserAction.setBadgeBackgroundColor({ color: 'black' });

// Starts sound notification interval and returns inteval id
const startSoundNotification = () => {

    // Sets icon badge to 'ON' 
    chrome.browserAction.setBadgeText({ text: 'ON' })
    chrome.browserAction.setBadgeBackgroundColor({ color: '#FF9800' });


    // Starts listening to BTC price changes on BitFlyer
    const DEFAULT_INTERVAL_SEC = 5
    let listenerIntervalSec = DEFAULT_INTERVAL_SEC
    let BTCPriceListener = setInterval(() => {
        let request = new XMLHttpRequest();
        request.open('GET', 'https://api.bitflyer.jp/v1/ticker?product_code=BTC_JPY', true);
        request.responseType = 'json';

        request.onload = function () {
            let data = this.response;
            console.log(data.ltp);
            // Sends BTC price to popup.html.
            chrome.runtime.sendMessage({
                msg: "ltp-updated",
                data: {
                    ltp: data.ltp,
                    priceChange: currentPrice - previousPrice
                }
            });
            currentPrice = data.ltp
            if (previousPrice) {
                let absPriceDiff = currentPrice - previousPrice
                if (currentPrice > previousPrice) {
                    // Updates badge text and background color.
                    chrome.browserAction.setBadgeText({ text: '+' })
                    chrome.browserAction.setBadgeBackgroundColor({ color: 'green' });

                    readPrice('プラス', absPriceDiff)
                    console.log('UP')
                    sound_down.pause()

                    previousPrice = data.ltp
                } else if (currentPrice < previousPrice) {
                    // Updates badge text and background color.
                    chrome.browserAction.setBadgeText({ text: '-' })
                    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });

                    readPrice('マイナス', absPriceDiff)
                    console.log('DOWN')
                    sound_samba.pause();

                    previousPrice = data.ltp
                } else {
                    console.log('NO CHANGE')
                }
            } else {
                previousPrice = data.ltp
            }
        };

        request.send();
    }, listenerIntervalSec * 1000)

    return BTCPriceListener
}

// Stores interval id to make it possible to stop it later.
let intervalID = ''

// Listens to sound-notification-toggled.
chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.msg === "sound-notification-toggled") {
            if (!isSoundNotificationOn) {
                intervalID = startSoundNotification()
                alert('音声通知をONにしました')
                isSoundNotificationOn = true
            } else if (isSoundNotificationOn) {
                // Stops interval.
                alert('音声通知をOFFにしました')
                clearInterval(intervalID)
                isSoundNotificationOn = false

                // Forces playng sound to stop.
                sound_samba.pause()
                sound_down.pause()

                // Sets icon bage to 'OFF'
                chrome.browserAction.setBadgeText({ text: 'OFF' })
                chrome.browserAction.setBadgeBackgroundColor({ color: 'black' });
            }
        }
    }
);