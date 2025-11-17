import { Navbar } from '../layout/navbar';

export const Layout = ({ children, user, onLogout }) => {
  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ABC7B1' }}
    >
      <Navbar user={user} onLogout={onLogout} />
      <main className="pt-0">
        {children}
      </main>
    </div>
  );
};

