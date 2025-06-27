import './Layout.css';
import Header from './Header';
import bgImage from '../assets/bg.png';

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
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;