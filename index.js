console.log(window.navigator.userAgent);

const browser = bowser.getParser(window.navigator.userAgent);

const browserObject = browser.getBrowser();

// {
//     "name": "Chrome",
//     "version": "113.0.0.0"
// }
console.log(browserObject);

const browserName = browser.getBrowserName().toLowerCase();
console.log(browserName); // 👉️ 113.0.0.0

const browserVersion = browserObject.version;
console.log(browserVersion); // 👉️ Chrome

switch (browserName) {
  case 'safari':
    document.querySelector('.safari-only').style.display = 'inline';
    break;
  case 'chrome':
    document.querySelector('.chrome-only').style.display = 'inline';
    break;
}
