import { getSelectedTokens } from "../utils/helper";
import { NewsItem } from "../types/common";
import { getSimilarityScore } from "../utils/getSimilarityScore";
import { ColumnsItemModel, NewsItemModel, NewsItemsKeywordsModel, NewsKeywordModel } from "../models";
import { Sequelize } from "sequelize-typescript";
import sequelize, { Dialect } from 'sequelize';
require('dotenv').config()

class Database{
    private sequelize: Sequelize;
    private newsItemModel: NewsItemModel

    constructor(){

        const username = process.env.DATABASE_USERNAME;
        const password = process.env.DATABASE_PASSWORD;
        const database = process.env.DATABASE;
        const host = process.env.DATABASE_HOST
        const dialect = process.env.DATABASE_DIALECT as Dialect;

        // this.newsItemModel = new NewsItemModel();
        

        this.sequelize = new Sequelize({
            database,
            username,
            password,
            host,
            dialect,
            logging: true,
            models: [NewsItemModel, NewsKeywordModel, NewsItemsKeywordsModel, ColumnsItemModel],
            query: {
                raw: true
            }
        });
    }

    connectToDatabase = async () => {
        try{
            this.sequelize.authenticate();
            console.log('Database connection has been established successfully.');
            return true
        }catch(err){
            console.log('Unable to connect to the database: ', err);
            return false
        }
    }

    getNewsURLs = async(source: string, pub_date: string) => {
        
        const newsItems = await NewsItemModel.findAll({
            
            where:{
                [sequelize.Op.and]: [
                    {source},
                    {pub_date: {
                        [sequelize.Op.like]: `${pub_date}%`
                    }}
                ]
            },
            attributes: ['news_link']
        })

        return newsItems.map(newsItem => newsItem.news_link);
    }

    insertNews = async (newsItem: NewsItem) => {

        const{heading, source, date, description, category, news_link, image_link} = newsItem;
    
        try{
            await NewsItemModel.create({
                heading, 
                source, 
                pub_date: date,
                news_link, 
                image_link, 
                description, 
                category
            })
        }catch(err){
            console.log('err while inserting news item: ', err);
        }
    }
    
    
    getKeywordsWordsFromDatabase = async () => {

        const storedKeywords = await NewsKeywordModel.findAll();

        return storedKeywords;
    }

    getNewsWithoutUpdatedKeywords = async () => {

        const newsItems = await NewsItemModel.findAll({
            
            where:{
                is_keywords_calculated: 0
            },
            attributes: ['pk_id', 'heading', 'source', 'pub_date', 'image_link', 'news_link']
        });

        console.log('newsItems to calculate keywords count: ', newsItems.length);

        return newsItems;
    }

    updateKeywords = async () => {

        let keywords = {};

        const newsItems = await this.getNewsWithoutUpdatedKeywords();

        const dbStoredKeywords = await this.getKeywordsWordsFromDatabase();

        for(let newsItem of newsItems){
            console.log('processing newsItem: ', newsItem['pk_id']);
            const heading = newsItem['heading'];
            const biTokens = getSelectedTokens(heading, dbStoredKeywords);

            for(let biToken of biTokens){
                const{keyword} = biToken;

                if(!(keyword in keywords)){
                    keywords = {
                        ...keywords,
                        [keyword]: biToken
                    }
                }

                keywords[keyword] = {
                    ...keywords[keyword],
                    count: keywords[keyword].count+1,
                    keyword: keyword,
                    news_item_ids: [...keywords[keyword].news_item_ids, newsItem['pk_id']]
                };
            }
        }

        console.log("Keywords updating in database started ");
        await this.updateKeywordsInDatabase(keywords);
        console.log("Keywords updating in database completed...! ");

        const updatedKeywordsNewsIds = newsItems.map(newsItem => newsItem['pk_id']);

        console.log('updating is_keywords_calculated field in database started...!');
        await this.updateIsKeywordsCalculated(updatedKeywordsNewsIds);
        console.log('updating is_keywords_calculated field in database completed...!');

    }

    updateKeywordsInDatabase = async(keywords) => {
        const newsKeywords = Object.values(keywords);
        
        const toUpdateKeywords = [];
        const toInsertKeywords = []

        for(const newsKeyword of newsKeywords){
            const keywordId = newsKeyword['pk_id'];
            if(keywordId > 0){
                toUpdateKeywords.push(newsKeyword);
            }else{
                toInsertKeywords.push(newsKeyword)
            }
        }

        for(const toUpdateKeyword of toUpdateKeywords){
            await NewsKeywordModel.update({ is_count_synced: 0,  count: toUpdateKeyword.count}, {
                where: {
                    pk_id: toUpdateKeyword.pk_id
                }
            })

            await this.insertKeywordNewsMappingInDatabase(toUpdateKeyword.pk_id, toUpdateKeyword['news_item_ids'])
        }

        
        for(const toInsertKeyword of toInsertKeywords){

            const newKeyword = await NewsKeywordModel.create({
                keyword: toInsertKeyword.keyword,
                count: toInsertKeyword.count,
            }, {returning: true})

            const insertedId = newKeyword.get('pk_id');

            await this.insertKeywordNewsMappingInDatabase(insertedId, toInsertKeyword['news_item_ids'])
        }
    }

    insertKeywordNewsMappingInDatabase = async (keywordId: number, newsIds: any[]) => {

        const results: any[] = await NewsItemsKeywordsModel.aggregate('news_item_id', 'DISTINCT', {
            plain: false,
            where: {
                keyword_id: keywordId,
                news_item_id: {
                    [sequelize.Op.in]: newsIds
                }
            }
        });

        const newsIdsFromDatabase = results.map(res => res['DISTINCT']);

        const newsIdsToInsert = this.findDifference(newsIds, newsIdsFromDatabase);

        for(const newsId of newsIdsToInsert){

            await NewsItemsKeywordsModel.create({
                news_item_id: newsId,
                keyword_id: keywordId
            })
        }
    }

    findDifference = (firstSet: any[], secondSet:any[]) => {
        return firstSet.filter(element => !secondSet.includes(element));
    }

    updateIsKeywordsCalculated = async (updatedKeywordsNewsIds) => {

        await NewsItemModel.update({is_keywords_calculated: 1}, {
            where: {
                pk_id: {
                    [sequelize.Op.in]: updatedKeywordsNewsIds
                }
            }
        })
    }

    dbStoredColumns = async (columnId: number, columnLink: string) => {


        const results = await ColumnsItemModel.findAll({
            where: {
                column_id: columnId,
                column_link: columnLink
            },
            attributes: ['column_link']
        })

        return results.map(res => res['column_link']);
    }

    storeColumnInDatabase = async (columnData) => {

        const {
            column_id,
            heading,
            date,
            description,
            source,
            column_link,
            image_link,
            category
        } = columnData;

        await ColumnsItemModel.create({
            column_id,
            heading, 
            source , 
            pub_date: date, 
            column_link, 
            image_link, 
            description, 
            category, 
            insert_time: date, 
            publish: 1
        })
    }

    getNewsItemIdNHeadlines = async () => {

        const results = await NewsItemModel.findAll({
            attributes: ['pk_id', 'heading']
        })

        return results;
    }

    insertSimilarNews = async (allNews) => {

        const new_news = await NewsItemModel.findAll({
            where: {
                is_related_calculated: 0
            },
            attributes: ['pk_id', 'heading', 'source', 'pub_date', 'news_link', 'image_link', 'description']
        })

        if (new_news.length === 0) {
            console.log('no new news are found');
            return new_news;
        }

        const pkIds = new_news.map(n => n['pk_id']);

        for(const target of new_news){

            for(const news of allNews){
                const score = getSimilarityScore(target['heading'], news['heading']);

                const targetId = target['pk_id'];
                const newsId = news['pk_id'];

                if (score >= 0.4 && score < 1.0 && targetId != newsId){

                    await NewsItemModel.create({
                        target_news_id: targetId, 
                        related_news_id: newsId, 
                        score, 
                        is_synced: 0
                    })
                }

            }
        }

        await NewsItemModel.update({is_related_calculated: 1},{
            where:{
                pk_id:{
                    [sequelize.Op.in]: pkIds
                }
            }
        })
        
        return new_news;
    }

    closeConnection = async () => {
        await this.sequelize.close();
        console.log('database connection closed...!');
    }
}

const database = new Database();

export default database;
