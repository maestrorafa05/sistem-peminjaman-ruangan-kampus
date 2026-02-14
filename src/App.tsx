import './App.css'

const title = 'PARAS'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="title">{title}</h1>
        <ul className="menu">
          <li><a href="#">Beranda</a></li>
          <li><a href="#">Peminjaman Ruangan</a></li>
          <li><a href="#">Daftar Ruangan</a></li>
        </ul>
        <footer className="sidebar-footer">
          <p>Copyright 2026 @ maestrorafa05</p>
        </footer>
      </aside>
    </div>
  )
}

export default App
