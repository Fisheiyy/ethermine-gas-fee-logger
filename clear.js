import fs from 'fs-extra'

function wait(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

console.log('Clearing Log Files')
wait(250)
fs.writeFile('.\\gasPrice.txt', '', (err) => {
    if (err) {console.log(`error ${err}`)}
})
wait(250)
fs.writeFile('.\\lowGasPrice.txt', '', (err) => {
    if (err) {console.log(`error ${err}`)}
})
wait(250)
console.log('Log Files Cleared')
process.exit()