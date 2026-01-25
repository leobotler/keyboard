import React from 'react';

const Header: React.FC = () => {
    return (
        <header>
            <h1>Universal Web App</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    {/* Add more navigation links here */}
                </ul>
            </nav>
        </header>
    );
};

export default Header;