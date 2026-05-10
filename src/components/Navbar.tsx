import {Link } from "react-router-dom";

function Navbar() {
    return (
        <nav style ={{ padding: "10px",background: "black"}}>
            <Link to="/" style={{ color: "white", margin: "10px" }}>Home</Link>
            <Link to="/dashboard" style={{ color: "white", margin: "10px" }}>Dashboard</Link>
            <Link to="/test" style={{ color: "white", margin: "10px" }}>Test</Link>
            <Link to="/result" style={{ color: "white", margin: "10px" }}>Result</Link>
        </nav>
    );
} 
export default Navbar;
