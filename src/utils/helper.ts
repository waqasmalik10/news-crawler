import { isNoiseWord } from "./noiseWords";

const isArrayListContainsSimilarWord = (al: string[], keyword: string) => {

    return al.includes(keyword);
}


const filterString = (str: string) => {
    //remove comma and colon
    str = str.trim();
    str = str.replace("’", "").replace(":", "").replace("”", "").replace("\"", "").replace("،", "").replace("؛", "");
    str = str.replace("،", "").replace("“", "").replace("‘", "").replace(".", "").replace("؟", "").replace("۔", "");

    return str;
}

const getBiTokens = (heading: string, dbStoredKeywords: any) => {

    const tokens = heading.split(" ");
    const biTokensList = []; 

    for(let i=0; i<tokens.length-1; i++){
        if (isNoiseWord(tokens[i], 1) || isNoiseWord(tokens[i + 1], 1)){
            continue;
        }
        console.log('not noise word: ', tokens[i]);
        let isTriTokenFound = false;

        if(i < tokens.length - 2){
            const triToken = tokens[i] + " " + tokens[i + 1] + " " + tokens[i + 2];

            if (triToken in dbStoredKeywords) {
                // we got tri-word matched with database
                isTriTokenFound = true;
                biTokensList.push(triToken);

                // we need to increment so we don't get messed-up tri-tokens parts
                i++;
            }
        }
        if(!isTriTokenFound){
            let biTokenKeyword = tokens[i] + " " + tokens[i + 1];
            let biToken={}

            if(!(biTokenKeyword in dbStoredKeywords)){
                console.log("No bi or tri words found in database. saving new bi combined word");
                console.log(biTokenKeyword);

                biTokenKeyword = filterString(biTokenKeyword).trim();
                biToken={
                    pk_id: 0,
                    keyword: biTokenKeyword,
                    count: 0,
                    is_count_synced: 0,
                    news_item_ids: []
                }
            }else{
                biToken = {...dbStoredKeywords[biTokenKeyword], news_item_ids: []};
            }

            biTokensList.push(biToken);
        }
    }

    return biTokensList;
}

export const getSelectedTokens = (heading: string, dbStoredKeywords:any) => {

    heading = filterString(heading);

    const biTokens = getBiTokens(heading, dbStoredKeywords);

    const tokens = heading.split(" ");

    for (let token of tokens) {
        token = token.trim();
        if (!isNoiseWord(token, 3) && !isArrayListContainsSimilarWord(biTokens, token)){
            const biToken = {
                pk_id: 0,
                count: 0,
                news_item_ids: [],
                keyword: token,
                is_count_synced: 0
            }
            biTokens.push(biToken);
        }
    }
    
    return biTokens;
}