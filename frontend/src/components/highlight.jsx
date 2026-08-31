import React from "react";
import './highlight.css'

function HighlightText({ children, onHover, onLeave, onClick}){
    return (
    <span
      className="highlight-text"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onMouseDown={onClick}
    >
      {children}
    </span>
  );
}

export default HighlightText;