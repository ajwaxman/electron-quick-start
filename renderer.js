/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const func = async () => {
    // const response = await window.versions.ping
    // console.log(response) // prints out 'pong'
}

const counter = document.getElementById('counter');
console.log(counter);

window.electronAPI.onUpdateCounter((event, value) => {
    const oldValue = Number(counter.innerText)
    const newValue = oldValue + value
    counter.innerText = newValue
    event.sender.send('counter-value', newValue);
})

console.log("hello")

func()