import Database from "../DBHelper/database";

export const relatedNewsJob = async () => {

    const allnews = await Database.getNewsItemIdNHeadlines();
    console.log("News Initial Count: " + allnews.length);

    console.log("Calculating related news items...");
    await Database.insertSimilarNews(allnews);
    console.log("related news items calculation is completed");
}