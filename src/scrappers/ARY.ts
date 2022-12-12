import { globalPage } from "../core/pupperter";
import Database from '../DBHelper/database';

const SOURCE = 'ARY';

const toCompleteDate = (date: string) => {
    return date.slice(0, 19).replace('T', ' ');
}


const getCategoriesURLs = async () => {

    const categories = {
        Pakistan: 'https://urdu.arynews.tv/category/pakistan/',
        International: 'https://urdu.arynews.tv/category/international-2/',
        Sports: 'https://urdu.arynews.tv/category/sports/',
        Business: 'https://urdu.arynews.tv/category/business/',
        Sehat: 'https://urdu.arynews.tv/category/sehat/',
        Entertainment: 'https://urdu.arynews.tv/category/fun-o-sakafat/',
        Science: 'https://urdu.arynews.tv/category/سائنس-اور-ٹیکنالوجی/'
    }

    return categories;
}

const getStoriesURLs = async (url: string) => {
    await globalPage.goto(url, { waitUntil: 'domcontentloaded' });

    const storiesUrls = await globalPage.$$eval(
        "article h2 a",
        (elements: HTMLAnchorElement[]) => elements.map(el => el.href)
    );
    
    return storiesUrls;
}

const getAllStoriesURLs = async (categories, today:string) => {

    let allStoriesURLs = {}
    console.log('getAllStoriesURLs');
    const dbStoredStoriesLinks = await Database.getNewsURLs(SOURCE, today);
    console.log('already stored stories: ', dbStoredStoriesLinks);

    for (const category in categories) {
        const categoryUrl = categories[category];
        const storiesURLs = await getStoriesURLs(categoryUrl);
        
        //don't store URLs of those stories that are already stored in db (means already crawled...!)
        allStoriesURLs[category] = storiesURLs
            .filter(storyUrl => {
                return !dbStoredStoriesLinks.includes(storyUrl)
            })
    }

    return allStoriesURLs;
}

const getStoryData = async (url:string) => {

    // separate try-catch is used so that if one part of news (e.g img of a news) is not available,
    // we could get remaining data of the news easily and flow of code execution should not be broken.

    try{
        await globalPage.goto(url, { waitUntil: 'domcontentloaded' });
    }catch(err){
        console.log('err while visiting page: ', url, err.message);
    }

    let heading = "";
    let date = "";
    let image_link="";
    let description = "";

    try{
        heading = await globalPage.$eval(".post-title", (element: HTMLElement) => {
            return element.textContent;
        })
    }catch(err){
        console.log('news headline not found', err.message, err.message);
    }

    try{
        date = await globalPage.$eval(".post-published", (element: HTMLTimeElement) => element.getAttribute("datetime"));
        date = toCompleteDate(date);
    }catch(err){
        console.log('news date and time not found', err.message, err.message);
    }

    try{
        image_link = await globalPage.$eval(".single-featured img", (element: HTMLImageElement) => element.getAttribute("data-src"));
        image_link = `https:${image_link}`;
    }catch(err){
        console.log('image of news not found!', err.message, err.message);
    }

    try{
        description = (await globalPage.$$eval(
            ".entry-content > p",
            (elements: HTMLElement[]) => elements.map(el => el.textContent.trim())
        )).join('\n');
    }catch(err){
        console.log('news description not found!', err.message, err.message);
    }
    
    return {
        heading,
        date,
        description,
        source: SOURCE,
        news_link: url,
        image_link
    }
}

const getAllStoriesData = async (allStoriesURLs) => {
    const newsData = [];

    for (const storyCategory in allStoriesURLs) {
        console.log('processing category: ', storyCategory);
        for (const url of allStoriesURLs[storyCategory]) {
            console.log('getting data from: ', url);
            const {date, ...rest} = await getStoryData(url);
            if(!date){
                console.log('cannot store this news into database...!');
                continue;
            }
            newsData.push({
                ...rest,
                date,
                category: storyCategory
            });

            console.log('started storing data in database...!');
            await storeNewsInDatabase(newsData);
            console.log('data stored in database successfully...!');
        }
    }

    return newsData;
}

const storeNewsInDatabase = async (allStoriesData) => {
    for(const newsItem of allStoriesData){
        await Database.insertNews(newsItem);
    }
}

const aryNewsCrawler = async (today: string) => {

    console.log("Starting " + SOURCE + " news crawling");

    console.log('getting all categories URL...!');
    const categories = await getCategoriesURLs();
    console.log('categories Urls done: ', categories);

    console.log('getting all stories URLs...!');
    const allStoriesURLs = await getAllStoriesURLs(categories, today);
    console.log('all stories URLs have been gotten...!');

    await getAllStoriesData(allStoriesURLs);

}


export { aryNewsCrawler };