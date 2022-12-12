export const getCurrentTime = () => {
    const date = new Date();

    let hours:any = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

    const seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    const time = hours + ":" + minutes + ":" + seconds
    
    return time;
};