import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'news_item',
    timestamps: false,
})
export class NewsItemModel extends Model {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER
  })
  pk_id: number;

  @Column({type: DataType.STRING})
  heading: string;
  
  @Column({type: DataType.STRING})
  source: string;

  @Column({type: DataType.STRING})
  pub_date: string;

  @Column({type: DataType.STRING})
  news_link: string;

  @Column({type: DataType.STRING})
  image_link: string;

  @Column({type: DataType.STRING})
  ogimage_link: string;

  @Column({type: DataType.STRING})
  description: string;

  @Column({type: DataType.STRING})
  category: string;

  @Column({type: DataType.BOOLEAN})
  category_verified: boolean;

  @Column({
    defaultValue: 0,
    type: DataType.BOOLEAN
  })
  is_manually_added: boolean;

  @Column({
    defaultValue: 0,
    type: DataType.BOOLEAN
  })
  is_synced: boolean;

  @Column({
    defaultValue: 0,
    type: DataType.BOOLEAN
  })
  is_keywords_calculated: boolean;

  @Column({
    defaultValue: 0,
    type: DataType.BOOLEAN
  })
  is_related_calculated: boolean;

}