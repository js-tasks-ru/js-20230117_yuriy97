/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {

  if (size === 0) return '';             
  if (!size) return string;   
  let counter = 0;  
  const strArr = [...string];
  return strArr.reduce((result,item,index) => {  
    if (index === 0) 
      return result = result+item;
    if (strArr[index] === strArr[index-1]) 
        counter = counter +1;
    else  
        counter = 0;
    if (counter < size) 
        result = result+item;
    return result;
    },'');
}
