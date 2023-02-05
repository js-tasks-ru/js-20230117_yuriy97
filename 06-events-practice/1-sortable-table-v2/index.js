export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {

    this.header = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.render();
    this.addEventListeners();
  }

  render(){
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }
 
  getTemplate(){

    let arr = [this.data]

    if(this.sorted.id && this.sorted.order)
        arr = this.arrSort(this.sorted.id, this.sorted.order)
      
    return ` <div data-element="productsContainer" class="products-list__container">
                <div class="sortable-table">
                  <div data-element="header" class="sortable-table__header sortable-table__row">
                     ${this.getHeader(this.header,this.sorted.id,this.sorted.order)}
                  </div>
                   <div data-element="body" class="sortable-table__body">
                     ${this.getBody(arr)}
                </div>
              </div>`;
  }

  getHeader(header,fieldValue = '',orderValue = ''){
    
    return [...header].map( elem => {
            return `<div class="sortable-table__cell" data-id="${elem.id}" data-sortable="${elem.sortable}" data-order= ${elem.id === fieldValue ? orderValue:this.sorted.order}>
                      <span>${elem.title}</span>
                      ${elem.id === fieldValue && elem.sortable ? `<span data-element="arrow" class="sortable-table__sort-arrow">
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
      if(!column) return;
      switch(column.sortType){
          case "number" :
            return direction*(a[field] - b[field]);
          case "string" :
            return direction*a[field].localeCompare(b[field],['ru','en']);
          case "date" :
            return direction*(new Date (a[field]) - new Date(b[field]));
          default :
            throw new Error(`Unknown type ${sortType}`);
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

  onPointerDown = (event) =>{

      const getElement = event.target.closest('[data-id]')
      const column = getElement.dataset.id;
      const sortable = getElement.dataset.sortable;
      let orderValue = getElement.dataset.order;

      if(sortable === 'false') return;
      
      if (!orderValue)
        orderValue = this.sorted.order;
      else
        orderValue =  orderValue === 'asc' ? 'desc' : 'asc';

      this.sort(column ,orderValue)   
  }
  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown',this.onPointerDown);
  }

  remove(){
   
    if(this.element){
      this.subElements.header.removeEventListener('pointerdown',this.onPointerDown);
      this.element.remove();
    }
  }

  destroy(){
    
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

