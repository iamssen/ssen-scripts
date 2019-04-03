const normalizeAffinitySvg = require('./normalizeAffinitySvg');

const xml = `<button type="button" class="btn white btn_new_window2">프로파일 설정<span class="sp"></span></button>`

normalizeAffinitySvg(xml).then(xml => console.log(xml))