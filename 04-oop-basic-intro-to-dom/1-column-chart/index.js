export default class ColumnChart {
  chartHeight = 50;
  chartData = {
    data:[],
    label: '',
    link: '',
    value: 0,
    formatHeading: data => data 
  };
  
  constructor(chartData) {
    Object.assign(this.chartData,chartData);
    this.render();
  }

  getTemplate() {
    return `
     <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.chartData.label}
        ${this.chartData.link ?
          `<a href="${this.chartData.link}" class="column-chart__link">View all</a>`:``}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.chartData.formatHeading(this.chartData.value)}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.renderColumns(this.chartData.data)}
        </div>
      </div>
      </div>
    `;
  }

  render() {
    
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate(); 

    if(!this.chartData.data.length)
      element.querySelector('.column-chart').classList.add('column-chart_loading');
    this.element = element.firstElementChild;  
  }

  renderColumns(data){

    if (!data.length) return '';
   
    return `${this.getColumnProps(data).map(item =>
                `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`).join('')}`;
  }
  
  update(newData){
    const newColumns = this.element.querySelector('.column-chart__chart');
    newColumns.innerHTML = this.renderColumns(newData);
  }

  remove() {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
  }
      
  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
}
