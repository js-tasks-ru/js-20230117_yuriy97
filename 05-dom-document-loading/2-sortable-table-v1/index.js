export default class SortableTable {
  constructor(headerConfig = [], data = []) {

    this.header = headerConfig;
    this.data = data;
    this.render();
  }

  render(){
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }
 
  getTemplate(){
    return ` <div data-element="productsContainer" class="products-list__container">
                <div class="sortable-table">
                  <div data-element="header" class="sortable-table__header sortable-table__row">
                     ${this.getHeader(this.header)}
                  </div>
                   <div data-element="body" class="sortable-table__body">
                     ${this.getBody(this.data)}
                </div>
              </div>`;
  }

  getHeader(header,fieldValue = '',orderValue = ''){
    
    return [...header].map( elem => {
            return `<div class="sortable-table__cell" data-id="${elem.id}" data-sortable="${elem.sortable}" data-order= ${elem.id === fieldValue ? orderValue:''}>
                      <span>${elem.title}</span>
                      ${elem.id === fieldValue ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                                                <span class="sort-arrow"></span>
                                               </span>` :''}
                    </div>`
            }
    ).join('');
  }

  getBody(data){
    return [...data].map( elem => {
     return `<a href="/products/${elem.id}" class="sortable-table__row">${[...this.header].map((item) => {
            if(item.template) 
              return item.template(elem[item.id])

            return `<div class="sortable-table__cell">${elem[item.id]}</div>`
          }).join('')}</a>`}
    ).join('');
  }


  sort(fieldValue ,orderValue){
    const sortedData = this.arrSort(fieldValue ,orderValue);
    this.subElements.body.innerHTML = this.getBody(sortedData);
    this.subElements.header.innerHTML = this.getHeader(this.header,fieldValue,orderValue);
  }
  

  arrSort(field, param){
    
    const arr = [...this.data]

    const directions = {
      asc: 1,
      desc: -1
    };
  
    const direction = directions[param];
    
    const column = this.header.find(elem => elem.id === field ? elem.sortType : '')
    return arr.sort((a,b) => {
      switch(column.sortType){
          case "number" :
            return direction*(a[field] - b[field]);
          case "string" :
            return direction*a[field].localeCompare(b[field],['ru','en']);
          case "date" :
             return direction*(new Date (a[field]) - new Date(b[field]));
          
          default :
            return direction*a[field].localeCompare(b[field],['ru','en']);
        }
      })
  }

  getSubElements() {

    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove(){
    this.element.remove();
  }

  destroy(){
    this.remove();
    this.subElements = {};
  }
}
