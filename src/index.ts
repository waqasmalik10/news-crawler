import { launchPuppeteer } from './core/pupperter'
import { aryNewsCrawler } from './scrappers/ARY';
import Database from './DBHelper/database';
import { relatedNewsJob } from './relatedNewsJob';


const crawlNewsChannels = async () => {

  const today = new Date().toISOString().split('T')[0];

  await aryNewsCrawler(today);
}


(async () => {
  await launchPuppeteer();

  const isConnected = await Database.connectToDatabase();

  if(!isConnected){
    return;
  }

  const now = new Date();
  console.log("Crawlinggg started at " + now.toDateString());

  // await crawlNewsChannels();

  await Database.updateKeywords();

  // await relatedNewsJob();
  
})();