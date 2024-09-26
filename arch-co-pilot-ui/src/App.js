import { useState } from "react";
import Homepage from "./Homepage";
import { destroySession, establishSession, isSessionValid } from "./utils/app";
import AuthPopup from "./components/AuthPopup";

function App() {
    const [isAuthenticated, updateIsAuthenticated] = useState(false);
    const [errorMsg, updateErrorMsg] = useState("");
    const [isAuthenticating, updateIsAuthenticating] = useState(false);

    const triggerSessionWatcher = () => {
        console.log("IssessionValid", isSessionValid());
        updateIsAuthenticated(isSessionValid());
    }
    
    useState(() => {
        setInterval(triggerSessionWatcher, 6000);
    }, []);

    
    const validatePassKey = (passKey) => {
        updateErrorMsg("");
        updateIsAuthenticating(true);
        setTimeout(() => {
            updateIsAuthenticating(false);
            if(passKey === 'architecturecopilotadmin' || passKey === 'test') {                
                updateIsAuthenticated(true);
                establishSession(passKey === 'architecturecopilotadmin' ? "superuser": "test");
            }
            else {
                updateErrorMsg("Incorrect passkey!");
                updateIsAuthenticated(false);
            }            
        }, 1000);
    }

    const logout = () => {
        destroySession();
        updateIsAuthenticated(false);
    }

    return (
        <div>
            {isAuthenticated ? 
                <Homepage logout={logout} />
            :
                <AuthPopup validatePassKey={validatePassKey} errorMsg={errorMsg} isAuthenticating={isAuthenticating} />
            }
        </div>
    )
}

export default App;