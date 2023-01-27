/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const arr = path.split('.');
    function returnGetter(obj = {}){
        let result = {...obj};
        for(const key of arr){
            result = result[key];
            if (result === undefined) break;
        }
        return result;
    }
    return returnGetter;
}
