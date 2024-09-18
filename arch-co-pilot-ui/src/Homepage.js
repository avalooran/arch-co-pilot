import './Homepage.css';
import SidePane from './components/SidePane';
import MainPane from './components/MainPane';   
function Homepage() {
    return (
        <div id="home-page-wrapper" className="full-vh">
            <SidePane />
            <MainPane />
        </div>
    )
}
export default Homepage;