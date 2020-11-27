
'use strict';
let currentPrice = null
let previousPrice = null
// Stores an absolute value of the price changes (previous -> current)
let absPriceDiff = 0

// Loads audio files
const sound_samba = new Audio('./test.mp3');
const sound_down = new Audio('./test.mp3');

// Reads BTC price changes based on its arguments.
const readPrice = (changeType, absPriceDiff) => {
    let synthes = new SpeechSynthesisUtterance(`${changeType}${absPriceDiff}円なり`)
    synthes.volume = 2
    synthes.onend = () => { if (changeType == 'プラス') { sound_samba.play() } else { sound_down.play() } }
    speechSynthesis.speak(
        synthes
    );
}


// Starts listening to BTC price changes on BitFlyer
const DEFAULT_INTERVAL_SEC = 2
let listenerIntervalSec = DEFAULT_INTERVAL_SEC
setInterval(() => {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://api.bitflyer.jp/v1/ticker?product_code=BTC_JPY', true);
    request.responseType = 'json';

    request.onload = function () {
        let data = this.response;
        console.log(data.ltp);
        currentPrice = data.ltp
        if (previousPrice) {
            let absPriceDiff = currentPrice - previousPrice
            if (currentPrice > previousPrice) {
                readPrice('プラス', absPriceDiff)
                console.log('UP')
                sound_down.pause()
                previousPrice = data.ltp
            } else if (currentPrice < previousPrice) {
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




