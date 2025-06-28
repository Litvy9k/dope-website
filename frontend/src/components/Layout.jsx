import './Layout.css';
import Header from './Header';
import bgImage from '../assets/bg.jpg';
import CRT from 'vault66-crt-effect';

function Layout({ children }) {
  return (
    <div
      className="bg"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
    <CRT>
      <Header />
      <main className="main-content">
        {children}
      </main>
    </CRT>
    </div>
  );
}

export default Layout;