import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

import {
  BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill,
  BsListCheck, BsMenuButtonWideFill, BsFillGearFill
} from 'react-icons/bs';

const Sidebar = ({ openSidebarToggle, OpenSidebar }) => {
  return (
    <div className="sidebar-container">
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
      <div className='sidebar-title'>
        <div className='sidebar-brand'>
        <FontAwesomeIcon icon={faUser} style={{color: "#fff",fontSize :"35px"}} />
          Profile
        </div>
        <span className='icon close_icon' onClick={OpenSidebar}>X</span>
      </div>
      <div className='sidebar'>
        <ul className='sidebar-list'>
          <li className='sidebar-list-item' onClick={OpenSidebar}>
            <NavLink to="category"><BsGrid1X2Fill className='icon' />Category</NavLink>
          </li>
          <li className='sidebar-list-item' onClick={OpenSidebar}>
            <NavLink to="buychallenge"><BsFillArchiveFill className='icon' /> Buy Challenge</NavLink>
          </li>
          <li className='sidebar-list-item' onClick={OpenSidebar}>
            <NavLink to="payout"><BsPeopleFill className='icon' /> Payout</NavLink>
          </li>
        
        </ul>
      </div>
    </aside>
    </div>
  );
};

export default Sidebar;
