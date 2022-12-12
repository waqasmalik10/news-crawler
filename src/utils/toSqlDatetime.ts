export const toSqlDatetime = (date: string) => {
    return new Date(date).toJSON().slice(0, 19).replace('T', ' ')
}