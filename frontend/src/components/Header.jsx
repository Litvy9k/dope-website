function Header() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: 'black',
      color: 'white'
    }}>
      <h1>My Website</h1>
      <button style={{ padding: '0.4rem 0.8rem' }}>
        切换语言
      </button>
    </header>
  );
}

export default Header;