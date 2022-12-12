import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'news_items_keywords',
    timestamps: false,
})
export class NewsItemsKeywordsModel extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER
  })
  pk_id: number;

  @Column({type: DataType.INTEGER})
  news_item_id: number;
  
  @Column({type: DataType.INTEGER})
  keyword_id: number;
}