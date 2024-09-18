import './Homepage.css';
import { useState } from 'react';
import SidePane from './components/SidePane';
import MainPane from './components/MainPane';   
function Homepage() {
    const [isSidePaneClose, updateIsSidePaneClose] = useState(false);
    const toggleSidePaneClose = () => {
        updateIsSidePaneClose(!isSidePaneClose);
    } 
    return (
        <div id="home-page-wrapper" className="full-vh">
            <SidePane isSidePaneClose={isSidePaneClose} toggleSidePaneClose={toggleSidePaneClose}/>
            <MainPane isSidePaneClose={isSidePaneClose} toggleSidePaneClose={toggleSidePaneClose}/>
        </div>
    )
}
export default Homepage;