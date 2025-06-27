import './Header.css'
import bgImage from '../assets/bg.png'

function Layout({ children }) {
  return (
    <div
      className="bg"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <Header />
      <main style={{ padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;