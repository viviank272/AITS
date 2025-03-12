import logo from './logo.svg';
import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
// Filename - our-quote/src/App.js:

import React from 'react'; 
import axios from 'axios';
class App extends React.Component { 
    
  state = {
    details : [],
}

componentDidMount() {

    let data ;

    axios.get('http://localhost:8000/aits/')
    .then(res => {
        data = res.data;
        this.setState({
            details : data    
        });
    })
    .catch(err => {})
}

render() {
return(
  <div>
        {this.state.details.map((detail, id) =>  (
        <div key={id}>
        <div >
              <div >
                    <h1>{detail.dept_name} </h1>
                    <footer >--- by
                    <cite title="Source Title">
                    {detail.dept_description}</cite>
                    </footer>
              </div>
        </div>
        </div>
        )
    )}
  </div>
  );
}
} 
export default App;
