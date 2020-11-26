import { Component } from 'react';
import RenderLinks from './renderLinks';
import './App.css';
class App extends Component {
  state = {
    links: [],
    value: ''
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }
  onAdd(){
    let value = this.state.value;
    if(!value)
      return;
    let newLinks = this.state.links;
    newLinks.push(value);
    this.setState({links:newLinks,value:''});
  }
  onSearch(){
    console.log(this.state.links);
    
  }
  render() {
    return (
      <div className="container">
        <div className="addContainer">
          <input type="text" value={this.state.value} onChange={this.handleChange.bind(this)} />
          <button onClick= {this.onAdd.bind(this)}>Add</button>
          <button onClick={this.onSearch.bind(this)}> search</button>
        </div>
        <div className="searchContainer">
          <RenderLinks links= {this.state.links}/>
        </div>
      </div>
    );
  }
}

export default App;
