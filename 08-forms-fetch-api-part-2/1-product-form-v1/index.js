import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  categories = [];
  productData = {};

  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
    images: []
  };

  constructor (productId) {
    this.productId = productId;
  }

  getTemplate(){
    return`
        <div class="product-form">
          <form data-element="productForm" class="form-grid">
            <div class="form-group form-group__half_left">
              <fieldset>
                <label class="form-label">Название товара</label>
                <input required="" type="text" name="title" id = 'title' class="form-control" placeholder= "Название товара">
              </fieldset>
            </div>
            <div class="form-group form-group__wide">
              <label class="form-label">Описание</label>
              <textarea required="" class="form-control" name="description" id = 'description' data-element="productDescription" placeholder="Описание товара"></textarea>
            </div>
            <div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              <div data-element="imageListContainer">
                <ul class="sortable-list">
                  ${this.getImages()}
                </ul>
              </div>
              <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            </div>
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
                ${this.getCategories()}
            </div>
            <div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                <label class="form-label">Цена ($)</label>
                <input required="" type="number" name="price" id = 'price' class="form-control" placeholder="${this.defaultFormData.price}">
              </fieldset>
              <fieldset>
                <label class="form-label">Скидка ($)</label>
                <input required="" type="number" name="discount" id = 'discount' class="form-control" placeholder="${this.defaultFormData.discount}">
              </fieldset>
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Количество</label>
              <input required="" type="number" class="form-control" name="quantity" id = quantity placeholder="${this.defaultFormData.quantity}">
            </div>
            <div class="form-group form-group__part-half">
              <label class="form-label">Статус</label>
              <select class="form-control" name="status" id = 'status'>
                <option value="1">Активен</option>
                <option value="0">Неактивен</option>
              </select>
            </div>
            <div class="form-buttons">
              <button type="submit" name="save" class="button-primary-outline">
                ${this.productId ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </form>
        </div>
       `
  }

 oneImageTemplate(url,source){
    return`
            <li class="products-edit__imagelist-item sortable-list__item" style="">
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt=${escapeHtml(source)} src="${escapeHtml(url)}">
                <span>${escapeHtml(source)}</span>
              </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button> 
            </li>
    `
  }
  getImages () {
    
    return  this.productData.images.map(item => {
      return this.oneImageTemplate(item.url, item.source);
    }).join('');
  }

  

  async loadCategories(){
    
    try {
        const url = new URL('/api/rest/categories?_sort=weight&_refs=subcategory',BACKEND_URL)
        return await fetchJson(url);
    } catch (error) {
      console.error('Can not load product categories')
    }    
  }

  async loadProduct () {
    try {
         const url = new URL('/api/rest/products',BACKEND_URL);
         url.searchParams.set('id', this.productId);
         return await fetchJson(url);
    } catch (error) {
      console.error('Can not load product information')
    }
    
  }

  setData () {
    
    const {productForm}  = this.subElements;
    const productDataFields = Object.keys(this.defaultFormData);
             
    productDataFields.map(item => {
      if(item !== 'images'){

        const element = productForm.querySelector(`#${item}`);
        element.value = this.productData[item] || this.defaultFormData[item];
      }
    });
  }

  getCategories(){

    const categoryElements = [...this.categories];
    const element = document.createElement("div");
    element.innerHTML = '<select class="form-control" name="subcategory" id = subcategory></select>'
    const selectElement = element.firstElementChild;
   
    categoryElements.map(category =>{
      category.subcategories.map( subcategory =>{
       const optionElement = new Option(`${category.title} > ${subcategory.title}`,subcategory.id);
       selectElement.append(optionElement);
      })  
    })
    return element.innerHTML;
  }

  async render () {
    
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId ? this.loadProduct() : Promise.resolve([this.defaultFormData]);
     
    const [categories,product] = await Promise.all([categoriesPromise,productPromise])
    this.categories = categories;
    const [productData] = product;    
    this.productData = productData;
    
    this.getCategories()

    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.setData();
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
   
    return this.element   
  }

  onSubmit = event => {

    event.preventDefault();
    this.save();
  };

  async save() {

    try {
        const url = new URL('/api/rest/products',BACKEND_URL);
        const result = await fetchJson( url, {
          method: this.productId ? 'PATCH' : 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(this.getData())
      });
      
      this.sendProductEvent(result.id);

    } catch (error) {
      console.error('Unable to make changes', error);
    }
  }

  sendProductEvent(id) {

    const event = this.productId ? new CustomEvent('product-updated', { detail: id }): new CustomEvent('product-saved');
    this.element.dispatchEvent(event);
  }

  getData () {
    
    const { productForm, imageListContainer } = this.subElements;
    const productDataFields = Object.keys(this.defaultFormData);
    const values = {}
             
    productDataFields.map(item => {

      if(item !== 'images'){      
        const value = productForm.querySelector(`#${item}`).value
        
        let  valueVerify = value;
        valueVerify = Number(valueVerify);

        values[item] =  isNaN(valueVerify) ? value : Number(value)  ;    
    }
    });

    values.id = this.productId ? this.productId : values.title;
    
    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    values.images = [];
    
    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }
    console.log(imagesHTMLCollection);
    return values;
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
   
    if(this.element){
      this.element.remove();
    }
  }

  destroy(){
    
    this.remove();
    this.element = null;
    this.subElements = {};
  }


}
