import ReactDOM from 'react-dom';
import React from 'react';
import Tags from 'react-tag-autocomplete';
let filterTags = [{id: 'bitcoin', name:'Bitcoin'}, { id: 'litecoin', name: 'Litecoin' }];
class App extends React.Component {
  constructor(props) {
    super(props);

    chrome.storage.sync.get("filterTags", function(items) {
      if (!chrome.runtime.error) {
        filterTags=items.filterTags;
      }
    });
    this.state = {
      isLoading: true,
      tickers: [],
      tags: filterTags,
      suggestions: []
    }
  }

  setCoinFilterChrome(tags){
    chrome.storage.sync.set({ "filterTags" : tags }, function() {
      if (chrome.runtime.error) {
        console.log("Runtime error.");
      }
      console.log("setCoinFilterChrome tags "+tags);
    });
  }

  handleDelete (i) {
    const tags = this.state.tags.slice(0)
    tags.splice(i, 1)
    this.setState({ tags })
    console.log("Deleting...")
    console.log(tags)
    this.setCoinFilterChrome(tags)
  }

  handleAddition (tag) {
    const tags = [].concat(this.state.tags, tag)
    this.setState({ tags })
    console.log("Adding...")
    console.log(tags)
    this.setCoinFilterChrome(tags)
  }

  componentWillMount() {
    chrome.storage.sync.get("filterTags", function(items) {
      if (!chrome.runtime.error) {
        if (typeof items.filterTags == "undefined") {
          filterTags=[{ id: 'bitcoin', name: 'Bitcoin' }];
        }
        else {filterTags=items.filterTags}
        console.log("sync.get filterTags ");
        console.log(filterTags);
      }
    });
    fetch("https://api.coinmarketcap.com/v1/ticker/")
    .then((response) => response.json()) // Transform the data into json
    .then(data => this.setState({
        isLoading: false,
        tickers: data,
        suggestions: data,
        tags: filterTags
      }))
    .catch(error => console.log('parsing failed', error))
  }
  render() {
    let showCoins=[];
    this.state.tags.map(function(ticker,index){
      showCoins = [].concat(showCoins, ticker.name)
    })
    return (
      <div>
        <Tags
          tags={this.state.tags}
          suggestions={this.state.suggestions}
          handleDelete={this.handleDelete.bind(this)}
          handleAddition={this.handleAddition.bind(this)} />
        <ul className="list">
        {this.state.suggestions
          .filter(function(ticker, index) {
          return showCoins.includes(ticker.name);
          })
          .map(function(ticker, index){
          var imgsrc = "https://files.coinmarketcap.com/static/img/coins/64x64/"+ticker.id+".png";
          return  <li key={ticker.id} className="list__item">
                    <div className="list__item__left">
                      <img className="list__item__thumbnail" src= {imgsrc} alt={ticker.name}/>
                    </div>

                    <div className="list__item__center">
                      <div className="list__item__title">{ticker.name} ({ticker.symbol})</div>
                      <div className="list__item__subtitle">${ticker.price_usd} {ticker.price_btc} BTC 1h {ticker.percent_change_1h}| 24h {ticker.percent_change_24h}| 7d {ticker.percent_change_7d}</div>
                    </div>
                  </li>;
              })}
        </ul>

      </div>
    )
  }
}
var mount = document.querySelector('#app');
ReactDOM.render(<App />, mount);
