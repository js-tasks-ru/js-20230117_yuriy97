import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  toLoad = 30;
  productsLoading = false;


  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item=>item.sortable).id,
      order : 'asc'
    },
    url = '',
    isSortLocally = false

  } = {}) {

    this.header = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url,BACKEND_URL);
    this.isSortLocally = isSortLocally;

    this.render();
    
  }

  async render(){
   
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.header.innerHTML = this.getHeader(this.header,this.sorted.id,this.sorted.order)
    this.tableData = await this.getTableData(this.sorted.id, this.sorted.order);
    this.addEventListeners();

  }
 
  getTemplate(){

 
    return ` <div data-element="productsContainer" class="products-list__container">
                <div class="sortable-table">
                  <div data-element="header" class="sortable-table__header sortable-table__row"></div>                      
                  <div data-element="body" class="sortable-table__body">
                  <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                </div>
              </div>`;
  }

  async getTableData(fieldValue= 'title', orderValue= 'asc') {

    const start = this.data.length;
    const end = start + this.toLoad;

    this.url.searchParams.set('_sort', fieldValue);
    this.url.searchParams.set('_order', orderValue);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.subElements.loading.style.display = 'block';
    const tableData = await fetchJson(this.url);
    this.subElements.loading.style.display = 'none';

    this.subElements.body.innerHTML = this.getBody(tableData);

    return tableData;
  }

  getHeader(header,fieldValue = 'title',orderValue = ''){
    
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

  sortOnClient (id, order) {

    const sortedData = this.arrSort(id ,order);
    this.subElements.body.innerHTML = this.getBody(sortedData);
    this.subElements.header.innerHTML = this.getHeader(this.header,id,order);
  }
  
  async sortOnServer (id, order) {
    
    this.subElements.header.innerHTML =  this.getHeader(this.header,id, order);
    this.data = await this.getTableData(id, order);
    this.subElements.body.innerHTML =  this.getBody(this.data);
    return this.data;

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
        
      orderValue =  orderValue === 'asc' ? 'desc' : 'asc'; 
      
      if(this.isSortLocally)
        this.sortOnClient(column,orderValue);
      else
        this.sortOnServer(column,orderValue);
  }

  onScroll = async () => {

    if (document.documentElement.clientHeight > this.element.getBoundingClientRect().bottom && !this.productsLoading) {
      
      this.productsLoading = true;
      const nextTableData = await this.getTableData(this.sorted.id, this.sorted.order);
      this.productsLoading = false;

      const element = document.createElement('div');

      element.innerHTML = this.getBody(nextTableData);

      this.subElements.body.append(...element.childNodes);

      this.data = [...this.data, ...nextTableData];
    }
  }

  addEventListeners() {

    this.subElements.header.addEventListener('pointerdown',this.onPointerDown);
    document.addEventListener('scroll', this.onScroll);
  }

  remove(){
   
    if(this.element){
      document.removeEventListener('scroll', this.onScroll);
      this.element.remove();
    }
  }

  destroy(){
    
    this.remove();
    this.element = null;
    this.subElements = {};
  }


}
