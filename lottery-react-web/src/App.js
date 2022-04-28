import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './routes/Main';

class App extends Component {

  constructor(props) {
    super(props);

    return (
      <BrowserRouter>
        <Routes>
          <Route path='/main' element={<Main />} />
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App;