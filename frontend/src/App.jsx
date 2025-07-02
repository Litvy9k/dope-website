// import './App.css';
// import bgImage from './assets/bg.png';
// import { motion } from "motion/react";

// function App() {
//   return (
//     <div className="app" style={{ backgroundImage: `url(${bgImage})` }}>
//       <header className="app-header">
//         <h2 style={{ marginTop: 5, marginLeft: 15 , marginRight: 15 }} className="PFD">My Homepage</h2>
//       </header>
//       <main className="app-content">
//         <p className="PFD">Welcome to my React ho12334page!</p>
//         <button className="fancy-button">Click Me</button>
//         <motion.button
//           className="fancy-button"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.95 }}>
//           Click me not
//         </motion.button>
//       </main>
//     </div>
//   );
// }

// export default App;

import Home from './pages/Home';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
  window.dispatchEvent(new Event('resize'));
    }, []);
    
  return <Home />;
}

export default App;