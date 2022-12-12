import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'news_keyword',
    timestamps: false,
})
export class NewsKeywordModel extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER
  })
  pk_id: number;

  @Column({type: DataType.BOOLEAN})
  is_count_synced: boolean;
  
  @Column({type: DataType.INTEGER})
  count: number;

  @Column({type: DataType.STRING})
  keyword: string;

}