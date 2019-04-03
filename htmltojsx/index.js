const {copy, paste} = require('copy-paste')
const HTMLtoJSX = require('htmltojsx')
const normalizeAffinitySvg = require('./normalizeAffinitySvg');

paste((error, clipboard) => { // get clipboard text
  normalizeAffinitySvg(clipboard).then(html => { // normalize affinity svg string
    const jsx = new HTMLtoJSX().convert(html) // convert html to jsx string
                               .split('\n') // strip React.createClass(...
                               .reverse().slice(3)
                               .reverse().slice(4)
                               .join('\n')
    
    copy(jsx) // save jsx string to clipboard
  })
})