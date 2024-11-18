import { useState } from "react";
import { APP_MENU } from "../../constants/app";
import "./MenuDropdown.css";
import { FaExternalLinkAlt, FaArrowCircleRight  } from "react-icons/fa";

const LINK_MENU_TYPE = "link";
const SUB_MENU_TYPE = "dropdown";

function MenuDropdown({
    menuOptions = APP_MENU
}) {
    const [activeMenu, updateActiveMenu] = useState({
        menu: null,
        submenu: null
    });
    const onMenuHover = (e, value) => {
        e.stopPropagation();
        updateActiveMenu(value)
    }
    return (
        <div id="menu-dropdown-wrapper" onMouseLeave={(e) => onMenuHover(e, { menu: null, submenu: null })}>
            {menuOptions.map((menu, menuIndex) => {
                return (
                    <div className="menu-dropdown-container" key={`menu-${menuIndex}`} onMouseOver={(e) => onMenuHover(e, { menu: menuIndex, submenu: null })}>
                        {menu.type == LINK_MENU_TYPE &&
                            <div>
                                <a href={menu.link} target='_blank' rel="noopener noreferrer">
                                    <span title={menu.label}>{menu.label}</span>
                                </a>
                            </div>
                        }
                        {menu.type == SUB_MENU_TYPE && <div>
                            <span title={menu.label}>{menu.label}</span>                           
                            {menu.sub && activeMenu.menu === menuIndex && <div className="submenu-dropdown-wrapper">
                                {menu.sub.map((submenu, submenuIndex) => {
                                    return (
                                        <div className="submenu-dropdown-cotainer" key={`submenu-${menuIndex - submenuIndex}`} onMouseOver={(e) => onMenuHover(e, { menu: menuIndex, submenu: submenuIndex })}>
                                            {submenu.type == LINK_MENU_TYPE &&
                                                <div className="link-type">
                                                    <a href={submenu.link} target='_blank' rel="noopener noreferrer">
                                                        <span title={submenu.label}>{submenu.label}</span>
                                                        <span><FaExternalLinkAlt /></span>
                                                    </a>
                                                    
                                                </div>
                                            }
                                            {submenu.type == SUB_MENU_TYPE && <div>
                                                <div className="dropdown-type">
                                                    <span title={submenu.label}>{submenu.label}</span>
                                                    <span><FaArrowCircleRight /></span>
                                                </div>
                                                {submenu.sub && (activeMenu.menu === menuIndex && activeMenu.submenu === submenuIndex) && <div className="submenu1-dropdown-wrapper">
                                                    {submenu.sub.map((submenu1, submenuIndex1) => {
                                                        return (
                                                            <div className="submenu1-dropdown-cotainer link-type" key={`submenu-${menuIndex - submenuIndex - submenuIndex1}`}>
                                                                {submenu1.type == LINK_MENU_TYPE &&
                                                                    <a href={submenu1.link} target='_blank' rel="noopener noreferrer">
                                                                        <span title={submenu1.label}>{submenu1.label}</span>
                                                                        <span><FaExternalLinkAlt /></span>
                                                                    </a>
                                                                }
                                                            </div>
                                                        )
                                                    })}
                                                </div>}
                                            </div>}
                                        </div>
                                    )
                                })}
                            </div>}
                        </div>}
                    </div>
                )
            })}
        </div>
    )
}

export default MenuDropdown;