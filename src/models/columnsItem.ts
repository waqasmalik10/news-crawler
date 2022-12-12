import { Table, Column, Model, DataType, Sequelize } from 'sequelize-typescript';

@Table({
    tableName: 'columns_item',
    timestamps: false,
})
export class ColumnsItemModel extends Model {
  @Column({
    autoIncrement: true,    
    primaryKey: true,
    type: DataType.INTEGER
  })
  pk_id: number;

  @Column({type: DataType.INTEGER})
  column_id: number;

  @Column({type: DataType.STRING})
  heading: string;
  
  @Column({type: DataType.STRING})
  source: string;

  @Column({type: DataType.STRING})
  pub_date: string;

  @Column({type: DataType.STRING})
  column_link: string;

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
    defaultValue: Sequelize.fn('NOW'),
    type: DataType.DATE
  })
  insert_time: string;

  @Column({
    type: DataType.BOOLEAN
  })
  publish: boolean;

  @Column({
    defaultValue: 0,
    type: DataType.BOOLEAN
  })
  is_synced: boolean;

  @Column({
    defaultValue: 0,
    type: DataType.BOOLEAN
  })
  has_custom_image: boolean

}