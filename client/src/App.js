import { Component, useState, useEffect } from 'react';
import RenderLinks from './renderLinks';
import './App.css';

const App = () => {

  const [link, setLink] = useState([]);

  const API_URL = '';

  useEffect(() => {

  }, []);

  const loadData = async () => {

    const response = await fetch(API_URL);
    const data = await response.json();

  }

  const handleChange = (event) => {
    this.setState({ value: event.target.value });
  }
  
  const onAdd = () => {
    let value = this.state.value;
    if (!value)
      return;
    let newLinks = this.state.links;
    newLinks.push(value);
    this.setState({ links: newLinks, value: '' });
  }

  const onSearch = () => {

    console.log(this.state.links);
  }

  return (
    <div className="container">
      <div className="addContainer">
        <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />
        <button onClick={this.onAdd.bind(this)}>Add</button>
        <button onClick={this.onSearch.bind(this)}> search</button>
      </div>
      <div className="searchContainer">
        <RenderLinks links={this.state.links} />
      </div>
    </div>
  );
};

export default App;
