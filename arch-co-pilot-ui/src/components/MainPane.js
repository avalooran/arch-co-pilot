import { APP_MENU, APP_NAME } from '../constants/app';
import { questionSuggestions } from '../constants/mock';
import './MainPane.css';

function MainPane() {
    return (
        <div id="mainpane-wrapper" className="full-vh">
            <div>
                <div id="mainpane-header">
                    <div id="app-name">
                        <span>{APP_NAME}</span>
                    </div>
                    <div id="app-menu">
                        {APP_MENU.map((x, ind) => (
                            <div key={`app-menu-${ind}`}>
                                {x.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div id="mainpane-subheader">
                    <div id="question-suggestion-wrapper">
                        <div>
                            {questionSuggestions.map((x, ind) => (
                                <div key={`question-suggestion-${ind}`}>
                                    {x.topic}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div id="mainpane-chatwindow">

                </div>
            </div>
        </div>
    )
}
export default MainPane;