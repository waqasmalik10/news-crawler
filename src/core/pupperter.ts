import puppeteer, { Browser, Page } from 'puppeteer';

let globalPage: Page = null!
let globalBrowser: Browser = null!

const launchPuppeteer = async () => {
  globalBrowser = await puppeteer.launch();
  globalPage = await globalBrowser.newPage();
}

const closePuppeteer = async () => {
  globalBrowser?.close()
}


export {
  globalPage,
  globalBrowser,
  launchPuppeteer,
  closePuppeteer
}