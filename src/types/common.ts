export interface allArticlesURLs{
    pakistan: string[];

}

export interface NewsItem {
    heading: string;
    category?: string;
    date: string;
    description: string;
    source: string;
    image_link?: string;
    news_link?: string;
}