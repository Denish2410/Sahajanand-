import { matchPath, useLocation } from './router/index.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import QuoteModal from './components/QuoteModal/QuoteModal.jsx';
import CompareTray from './components/CompareTray/CompareTray.jsx';
import CartDrawer from './components/CartDrawer/CartDrawer.jsx';
import Home from './pages/Home/Home.jsx';
import Products from './pages/Products/Products.jsx';
import Category from './pages/Category/Category.jsx';
import ProductDetails from './pages/ProductDetails/ProductDetails.jsx';
import Compare from './pages/Compare/Compare.jsx';
import Solutions from './pages/Solutions/Solutions.jsx';
import About from './pages/About/About.jsx';
import Contact from './pages/Contact/Contact.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';


const ROUTES = [
  ['/', Home],
  ['/products', Products],
  ['/category/:slug', Category],
  ['/product/:id', ProductDetails],
  ['/compare', Compare],
  ['/solutions', Solutions],
  ['/about', About],
  ['/contact', Contact],
];

export default function App() {
  const { pathname } = useLocation();
  let Page = NotFound;
  let params = {};
  for (const [pattern, Component] of ROUTES) {
    const m = matchPath(pattern, pathname);
    if (m) { Page = Component; params = m; break; }
  }
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <Navbar />
      <main id="main" className="page" key={pathname}>
        <Page params={params} />
      </main>
      <Footer />
      <CompareTray />
      <QuoteModal />
      <CartDrawer />
    </>
  );
}
