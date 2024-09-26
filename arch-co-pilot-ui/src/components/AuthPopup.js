import { PiAtomFill } from "react-icons/pi";
import { FaUnlock } from "react-icons/fa6";
import "./AuthPopup.css";
import { APP_NAME } from "../constants/app";
import { useState } from "react";

function AuthPopup({ validatePassKey, errorMsg, isAuthenticating }) {
    const [passKey, updatePassKey] = useState("");
    const onPassKeyUpdate = (e) => {
        updatePassKey(e.target.value);
    }
    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            proceedToValidate();
        }
    }
    const proceedToValidate = () => {
        validatePassKey(passKey);
    }
    return (
        <div id="auth-popup-wrapper" className="full-vh">
            <div id="auth-popup-header">
                <PiAtomFill
                    size={40}
                    color={"#0E5447"}
                />
                <span>{APP_NAME}</span>
            </div>
            <div id="auth-popup-body">
                <input type="password" disabled={isAuthenticating} placeholder="Enter your passkey" onChange={onPassKeyUpdate} onKeyDown={onKeyDown}></input>
                <div id="auth-popup-unlock" className={isAuthenticating ? "disabled": ""} onClick={proceedToValidate}>
                    <FaUnlock
                        size={20}
                        color={"white"}
                    />
                </div>                
            </div>
            <div id="auth-popup-footer">
                {errorMsg && <div>{errorMsg}</div>}
            </div>
        </div>
    )
}
export default AuthPopup;