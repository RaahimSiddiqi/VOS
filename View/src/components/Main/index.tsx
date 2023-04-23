import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { Component } from "react";
import Header from '../Header';
import Editor from '../Editor';
import Home from '../Home';

const Main = () => {
    return ( 
        <Router>
            <Header/>
            <Routes>
                <Route path='/' element={<Home />}/>
                <Route path='/editor' element={<Editor />}  />
                <Route path= "*" element={<Navigate to ="/" />}/>
            </Routes>
        </Router>
     );
}
 

 
export default Main;