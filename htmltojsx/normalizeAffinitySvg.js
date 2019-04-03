const {Parser, Builder} = require('xml2js')

/** @namespace result.svg */
/** @namespace result.svg.$ */
/** @namespace result.svg.$.viewBox */
/** @namespace Builder.buildObject */

module.exports = source => new Promise(resolve => {
  new Parser().parseString(source, (err, result) => {
    if (err) {
      resolve(source);
      return;
    }
    
    if (result.svg && result.svg.$
      && result.svg.$.width === '100%'
      && result.svg.$.height === '100%'
      && typeof result.svg.$.viewBox === 'string') {
      const [cx, cy, width, height] = result.svg.$.viewBox.split(' ');
      result.svg.$.width = width;
      result.svg.$.height = height;
      
      delete result.svg.$['version'];
      delete result.svg.$['xmlns'];
      delete result.svg.$['xmlns:xlink'];
      delete result.svg.$['xml:space'];
      
      resolve(new Builder().buildObject(result).split('\n').slice(1).join('\n'));
    } else {
      resolve(source);
    }
  })
})