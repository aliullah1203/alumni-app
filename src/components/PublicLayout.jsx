import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

export default function PublicLayout({ active, children, showRegister = true }) {
  return (
    <div className="page">
      <Navbar active={active} showRegister={showRegister} />
      <main className="page__main">{children}</main>
      <Footer />
      <BottomNav active={active} />
    </div>
  );
}
