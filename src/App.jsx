
import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Search, ShoppingCart, Heart, UserRound, Menu, X,
  Truck, ShieldCheck, RotateCcw, Headphones, Plus, Pencil,
  Trash2, Package, IndianRupee, TrendingUp, BookMarked,
  ClipboardList, LogOut, ChevronRight, Star,
  SlidersHorizontal, CheckCircle, Minus
} from "lucide-react";

const initialBooks = [
  { id: 1, title: "Atomic Habits", author: "James Clear", category: "Self Help", price: 499, oldPrice: 699, rating: 4.8, cover: "https://images-na.ssl-images-amazon.com/images/I/81wgcld4wxL.jpg", stock: 24 },
  { id: 2, title: "Think Like a Monk", author: "Jay Shetty", category: "Self Help", price: 399, oldPrice: 599, rating: 4.7, cover: "https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg", stock: 18 },
  { id: 3, title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", category: "Business", price: 449, oldPrice: 599, rating: 4.7, cover: "https://images-na.ssl-images-amazon.com/images/I/81bsw6fnUiL.jpg", stock: 32 },
  { id: 4, title: "The Psychology of Money", author: "Morgan Housel", category: "Business", price: 349, oldPrice: 499, rating: 4.8, cover: "https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg", stock: 15 },
  { id: 5, title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography", price: 299, oldPrice: 399, rating: 4.7, cover: "https://images-na.ssl-images-amazon.com/images/I/71UwSHsz4BL.jpg", stock: 21 },
  { id: 6, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", price: 279, oldPrice: 399, rating: 4.6, cover: "https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg", stock: 12 },
  { id: 7, title: "Deep Work", author: "Cal Newport", category: "Productivity", price: 429, oldPrice: 599, rating: 4.6, cover: "https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg", stock: 9 },
  { id: 8, title: "Ikigai", author: "Héctor García", category: "Self Help", price: 249, oldPrice: 349, rating: 4.5, cover: "https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg", stock: 27 }
];

const categories = [
  "All Books", "Self Help", "Business",
  "Biography", "Fiction", "Productivity"
];

const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN");

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [books, setBooks] = useState(() => read("pg_books", initialBooks));
  const [cart, setCart] = useState(() => read("pg_cart", []));
  const [orders, setOrders] = useState(() => read("pg_orders", []));
  const [wishlist, setWishlist] = useState(() => read("pg_wish", []));
  const [customer, setCustomer] = useState(() => read("pg_customer", null));

  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Books");
  const [sort, setSort] = useState("featured");
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [editing, setEditing] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [checkout, setCheckout] = useState(false);

  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const emptyForm = {
    title: "",
    author: "",
    category: "Fiction",
    price: "",
    oldPrice: "",
    stock: "",
    cover: ""
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("pg_books", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("pg_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("pg_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("pg_wish", JSON.stringify(wishlist));
  }, [wishlist]);

  const filtered = useMemo(() => {
    let result = books.filter((b) =>
      (category === "All Books" || b.category === category) &&
      `${b.title} ${b.author} ${b.category}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    if (sort === "price-low")
      result.sort((a, b) => a.price - b.price);

    if (sort === "price-high")
      result.sort((a, b) => b.price - a.price);

    if (sort === "name")
      result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [books, category, query, sort]);

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping;

  const toast = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const nav = (p) => {
    setPage(p);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addCart = (book) => {
    if (book.stock <= 0) {
      toast("This book is out of stock");
      return;
    }

    const existing = cart.find((x) => x.id === book.id);

    if (existing && existing.qty >= book.stock) {
      toast("Maximum available stock reached");
      return;
    }

    setCart((old) => {
      const found = old.find((x) => x.id === book.id);

      return found
        ? old.map((x) =>
            x.id === book.id ? { ...x, qty: x.qty + 1 } : x
          )
        : [...old, { ...book, qty: 1 }];
    });

    toast("Added to your cart");
  };

  const changeQty = (id, difference) => {
    setCart((old) =>
      old.map((x) => {
        if (x.id !== id) return x;

        const book = books.find((b) => b.id === id);
        const maxStock = book?.stock ?? x.qty;

        return {
          ...x,
          qty: Math.max(1, Math.min(maxStock, x.qty + difference))
        };
      })
    );
  };

  const toggleWish = (book) => {
    const exists = wishlist.includes(book.id);

    setWishlist((old) =>
      exists
        ? old.filter((id) => id !== book.id)
        : [...old, book.id]
    );

    toast(exists ? "Removed from wishlist" : "Added to wishlist");
  };

  const login = (e) => {
    e.preventDefault();

    const customerData = {
      name: authName.trim() || authEmail.split("@")[0],
      email: authEmail
    };

    setCustomer(customerData);
    localStorage.setItem("pg_customer", JSON.stringify(customerData));
    setShowAuth(false);
    setAuthPassword("");
    toast("Welcome to SaviOmBooks!");
  };

  const placeOrder = () => {
    if (!customer) {
      setShowAuth(true);
      return;
    }

    if (!cart.length) return;

    const order = {
      id: "PG" + Date.now().toString().slice(-7),
      customer: customer.name,
      email: customer.email,
      items: cart,
      total,
      status: "Pending",
      date: new Date().toLocaleDateString("en-IN")
    };

    setOrders((old) => [order, ...old]);

    setBooks((old) =>
      old.map((book) => {
        const ordered = cart.find((x) => x.id === book.id);
        return ordered
          ? { ...book, stock: Math.max(0, book.stock - ordered.qty) }
          : book;
      })
    );

    setCart([]);
    setCheckout(false);
    nav("orders");
    toast("Order placed successfully!");
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowBookForm(true);
  };

  const editBook = (book) => {
    setEditing(book.id);
    setForm({ ...book });
    setShowBookForm(true);
  };

  const saveBook = (e) => {
    e.preventDefault();

    const book = {
      ...form,
      id: editing || Date.now(),
      price: Number(form.price),
      oldPrice: Number(form.oldPrice || form.price),
      stock: Number(form.stock || 0),
      rating: form.rating || 4.5,
      cover: form.cover ||
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
    };

    setBooks((old) =>
      editing
        ? old.map((x) => x.id === editing ? book : x)
        : [book, ...old]
    );

    setShowBookForm(false);
    setEditing(null);
    setForm(emptyForm);
    toast(editing ? "Book updated" : "Book added to store");
  };

  const deleteBook = (id) => {
    if (window.confirm("Delete this book from the store?")) {
      setBooks((old) => old.filter((b) => b.id !== id));
      setWishlist((old) => old.filter((x) => x !== id));
      setCart((old) => old.filter((x) => x.id !== id));
      toast("Book deleted");
    }
  };

  const changeStatus = (id, status) => {
    setOrders((old) =>
      old.map((o) => o.id === id ? { ...o, status } : o)
    );
  };

  // HEADER

  const Header = () => (
    <>
      <div className="topbar">
        <div className="container top-inner">
          <span><Truck size={15} /> Free shipping on orders above ₹499</span>
          <span>Easy Returns</span>
          <span>24/7 Customer Support</span>
          <span className="top-right">
            Welcome to SaviOmBooks! | {customer ? customer.name : "Read • Learn • Grow"}
          </span>
        </div>
      </div>

      <header className="header">
        <div className="container head-inner">

          <button className="hamb" onClick={() => setMobileMenu(!mobileMenu)}>
            <Menu />
          </button>

          <button className="brand" onClick={() => nav("home")}>
            <span className="brand-icon"><BookOpen size={34} /></span>
            <span>
              <strong>SaviOmBooks</strong>
              <small>Read · Learn · Grow</small>
            </span>
          </button>

          <div className="search">
            <input
              placeholder="Search for books, authors..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage("books");
              }}
              onKeyDown={(e) => e.key === "Enter" && nav("books")}
            />
            <button onClick={() => nav("books")}><Search /></button>
          </div>

          <div className="head-actions">
            <button onClick={() => nav("wishlist")}>
              <Heart />
              <span>Wishlist</span>
            </button>

            <button onClick={() => nav("cart")} className="cart-link">
              <ShoppingCart />
              <i>{cartCount}</i>
            </button>

            <button
              className="account"
              onClick={() => customer ? nav("account") : setShowAuth(true)}
            >
              <UserRound />
              <span>{customer ? "My Account" : "Login / Register"}</span>
            </button>
          </div>
        </div>
      </header>

      <nav className={`nav ${mobileMenu ? "open" : ""}`}>
        <div className="container nav-inner">
          <button onClick={() => nav("home")}>Home</button>
          <button onClick={() => nav("books")}>Books</button>
          <button onClick={() => nav("about")}>About Us</button>
          <button onClick={() => nav("career")}>Carrier</button>
        </div>
      </nav>
    </>
  );

  // FOOTER

  const Footer = () => (
    <footer>
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <BookOpen />
            <strong>SaviOmBooks</strong>
          </div>
          <p>Your one-stop destination for books that inspire, educate and entertain.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <button onClick={() => nav("books")}>Browse Books</button>
          <button onClick={() => nav("orders")}>My Orders</button>
          <button onClick={() => nav("seller")}>Seller Dashboard</button>
          <button onClick={() => nav("career")}>Carrier</button>
        </div>

        <div>
          <h4>Customer Support</h4>
          <p>help@saviombooks.com</p>
          <p>Mon–Sat, 9 AM–6 PM</p>
        </div>

        <div>
          <h4>Stay Connected</h4>
          <p>Read more. Learn more. Grow more.</p>
          <p>© 2026 SaviOmBooks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  // BOOK CARD

  const BookCard = ({ b }) => (
    <article className="book-card">

      <button className="wish" onClick={() => toggleWish(b)} aria-label="Wishlist">
        <Heart
          size={18}
          fill={wishlist.includes(b.id) ? "#e44b4b" : "none"}
          color={wishlist.includes(b.id) ? "#e44b4b" : "#738098"}
        />
      </button>

      <div className="cover-wrap">
        <img
          src={b.cover}
          alt={b.title}
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400";
          }}
        />
      </div>

      <div className="book-info">
        <span className="category-tag">{b.category}</span>
        <h3>{b.title}</h3>
        <p>{b.author}</p>

        <div className="rating">
          <Star size={14} fill="#f5b400" color="#f5b400" />
          {b.rating}
          <span>({Math.floor(b.rating * 230)} reviews)</span>
        </div>

        <div className="price-line">
          <b>{money(b.price)}</b>
          <del>{money(b.oldPrice)}</del>
          <span className="discount">
            {b.oldPrice > 0
              ? Math.max(0, Math.round((1 - b.price / b.oldPrice) * 100))
              : 0}% OFF
          </span>
        </div>

        <button
          className="add-btn"
          onClick={() => addCart(b)}
          disabled={b.stock <= 0}
        >
          <ShoppingCart size={16} />
          {b.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  );

  // SERVICES

  const Services = () => (
    <div className="services">
      <div><Truck /><span><b>Free Shipping</b><small>On orders above ₹499</small></span></div>
      <div><ShieldCheck /><span><b>Secure Payments</b><small>100% safe checkout</small></span></div>
      <div><RotateCcw /><span><b>Easy Returns</b><small>Hassle-free returns</small></span></div>
      <div><Headphones /><span><b>24/7 Support</b><small>We're here to help</small></span></div>
    </div>
  );

  // HOME PAGE

  const Home = () => (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">WELCOME TO SAVIOMBOOKS</span>
          <h1>Discover Your<br />Next Favorite <em>Book</em></h1>
          <p>Explore thousands of books across all genres at the best prices.</p>
          <button className="primary-btn" onClick={() => nav("books")}>
            Shop Now <ChevronRight />
          </button>
        </div>

        <div className="hero-art">
          <div className="book-stack">
            <div>SELF HELP</div>
            <div>FICTION</div>
            <div>TECHNOLOGY</div>
            <div>SCIENCE</div>
            <div>BUSINESS</div>
          </div>
          <div className="coffee">☕<small>Read More</small></div>
        </div>
      </section>

      <div className="container">

        <div className="category-strip">
          {categories.slice(1).map((c) => (
            <button key={c} onClick={() => {
              setCategory(c);
              nav("books");
            }}>
              {c}
            </button>
          ))}
        </div>

        <div className="section-heading">
          <div>
            <span className="eyebrow">HANDPICKED FOR YOU</span>
            <h2>Featured Books</h2>
          </div>
          <button className="text-link" onClick={() => nav("books")}>
            View All Books <ChevronRight size={17} />
          </button>
        </div>

        <div className="home-products">
          {books.slice(0, 4).map((b) => <BookCard key={b.id} b={b} />)}
        </div>

        <section className="promo">
          <div>
            <span>LIMITED TIME OFFER</span>
            <h2>Big Savings<br />on Books!</h2>
            <p>Get up to 50% OFF on your favorite reads.</p>
            <button className="primary-btn" onClick={() => nav("books")}>
              Explore Offers <ChevronRight />
            </button>
          </div>
          <div className="promo-emoji">📚</div>
        </section>

        <Services />
      </div>
    </>
  );

  // BOOKS PAGE

  const BooksPage = () => (
    <main className="container page-pad">
      <div className="page-title">
        <div>
          <span className="eyebrow">EXPLORE OUR COLLECTION</span>
          <h1>Discover Books</h1>
          <p>Find your next great read from our collection.</p>
        </div>

        <div className="sort">
          <SlidersHorizontal />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        {categories.map((c) => (
          <button
            className={category === c ? "selected" : ""}
            key={c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="result-count">{filtered.length} books found</p>

      <div className="product-grid">
        {filtered.map((b) => <BookCard key={b.id} b={b} />)}
      </div>

      {!filtered.length && (
        <div className="empty">
          <BookOpen size={42} />
          <h3>No books found</h3>
          <p>Try another search or category.</p>
        </div>
      )}
    </main>
  );

  // CART PAGE

  const CartPage = () => (
    <main className="container page-pad">
      <div className="page-title">
        <div>
          <span className="eyebrow">YOUR SELECTION</span>
          <h1>Shopping Cart</h1>
        </div>
      </div>

      {!cart.length ? (
        <div className="empty">
          <ShoppingCart size={45} />
          <h2>Your cart is empty</h2>
          <p>Find a book you'll love.</p>
          <button className="primary-btn" onClick={() => nav("books")}>
            Browse Books
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((x) => (
              <div className="cart-row" key={x.id}>
                <img src={x.cover} alt={x.title} />

                <div className="cart-detail">
                  <h3>{x.title}</h3>
                  <p>{x.author}</p>
                  <b>{money(x.price)}</b>
                </div>

                <div className="qty">
                  <button onClick={() => changeQty(x.id, -1)}><Minus size={14} /></button>
                  {x.qty}
                  <button onClick={() => changeQty(x.id, 1)}><Plus size={14} /></button>
                </div>

                <b>{money(x.price * x.qty)}</b>

                <button
                  className="icon-btn"
                  onClick={() => setCart((old) => old.filter((a) => a.id !== x.id))}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>

          <aside className="summary">
            <h3>Order Summary</h3>
            <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <div><span>Shipping</span><b>{shipping === 0 ? "FREE" : money(shipping)}</b></div>
            <div className="summary-total">
              <span>Total</span><strong>{money(total)}</strong>
            </div>

            <button className="primary-btn full" onClick={() => setCheckout(true)}>
              Proceed to Checkout
            </button>

            {checkout && (
              <div className="checkout-box">
                <h4>Delivery details</h4>
                <p>
                  {customer
                    ? `Delivering for ${customer.name} (${customer.email})`
                    : "Please login to continue."}
                </p>
                <button className="primary-btn full" onClick={placeOrder}>
                  Place Order
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );

  // WISHLIST PAGE

  const WishlistPage = () => {
    const savedBooks = books.filter((b) => wishlist.includes(b.id));

    return (
      <main className="container page-pad">
        <div className="page-title"><h1>My Wishlist</h1></div>

        <div className="product-grid">
          {savedBooks.map((b) => <BookCard key={b.id} b={b} />)}
        </div>

        {!savedBooks.length && (
          <div className="empty">
            <Heart />
            <h2>Your wishlist is waiting</h2>
            <button className="primary-btn" onClick={() => nav("books")}>
              Explore Books
            </button>
          </div>
        )}
      </main>
    );
  };

  // ORDERS PAGE

  const OrdersPage = () => (
    <main className="container page-pad">
      <div className="page-title"><h1>My Orders</h1></div>

      {!orders.length ? (
        <div className="empty">
          <Package />
          <h2>No orders yet</h2>
          <button className="primary-btn" onClick={() => nav("books")}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.items.map((i) => `${i.title} × ${i.qty}`).join(", ")}</td>
                  <td>{money(o.total)}</td>
                  <td><span className="status">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );

  // SELLER DASHBOARD

  const Seller = () => (
    <main className="container page-pad">
      <div className="page-title">
        <div>
          <span className="eyebrow">STORE MANAGEMENT</span>
          <h1>Seller Dashboard</h1>
          <p>Manage your SaviOmBooks bookstore.</p>
        </div>

        <button className="primary-btn" onClick={openAdd}>
          <Plus /> Add New Book
        </button>
      </div>

      <div className="stats">
        <div><span><BookMarked /></span><small>Total Books</small><strong>{books.length}</strong></div>
        <div><span><ClipboardList /></span><small>Total Orders</small><strong>{orders.length}</strong></div>
        <div><span><IndianRupee /></span><small>Order Revenue</small><strong>{money(orders.reduce((s, o) => s + o.total, 0))}</strong></div>
        <div><span><TrendingUp /></span><small>Units in Stock</small><strong>{books.reduce((s, b) => s + b.stock, 0)}</strong></div>
      </div>

      {showBookForm && (
        <form className="book-form" onSubmit={saveBook}>
          <h3>{editing ? "Edit Book" : "Add a Book"}</h3>

          <div className="form-grid">
            <label>
              Book title
              <input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>

            <label>
              Author
              <input required value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </label>

            <label>
              Category
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>

            <label>
              Selling price (₹)
              <input required type="number" min="1" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </label>

            <label>
              MRP (₹)
              <input type="number" min="1" value={form.oldPrice}
                onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} />
            </label>

            <label>
              Stock quantity
              <input type="number" min="0" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </label>

            <label className="wide">
              Cover image URL
              <input value={form.cover}
                onChange={(e) => setForm({ ...form, cover: e.target.value })}
                placeholder="https://..." />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="outline-btn" onClick={() => {
              setEditing(null);
              setShowBookForm(false);
              setForm(emptyForm);
            }}>
              Cancel
            </button>

            <button className="primary-btn">
              {editing ? "Save Changes" : "Add Book"}
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Book</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>
                  <div className="mini-book">
                    <img src={b.cover} alt={b.title} />
                    <span><b>{b.title}</b><small>{b.author}</small></span>
                  </div>
                </td>
                <td>{b.category}</td>
                <td>{money(b.price)}</td>
                <td>{b.stock}</td>
                <td>
                  <button className="icon-btn" onClick={() => editBook(b)}>
                    <Pencil size={17} />
                  </button>
                  <button className="icon-btn danger" onClick={() => deleteBook(b.id)}>
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="orders-heading">Recent Orders</h2>

      {orders.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer}<small>{o.email}</small></td>
                  <td>{money(o.total)}</td>
                  <td><span className="status">{o.status}</span></td>
                  <td>
                    <select value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}>
                      <option>Pending</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">New customer orders will appear here.</p>
      )}
    </main>
  );

  // ACCOUNT PAGE

  const Account = () => (
    <main className="container page-pad">
      <div className="account-card">
        <UserRound size={38} />
        <h1>Hello, {customer?.name || "Reader"}!</h1>
        <p>{customer?.email}</p>

        <button className="outline-btn" onClick={() => {
          setCustomer(null);
          localStorage.removeItem("pg_customer");
          nav("home");
          toast("You have logged out");
        }}>
          <LogOut size={16} /> Log out
        </button>
      </div>
    </main>
  );

  // ABOUT US PAGE

  const About = () => (
    <main className="container page-pad">

      <section className="about-banner">
        <span>WELCOME TO SAVIOMBOOKS</span>
        <h1>About Us</h1>
        <p>Read • Learn • Grow. A bookstore for curious minds.</p>
        <p>Discover the World of Books, Knowledge and Imagination.</p>
      </section>

      <section className="about-intro">
        <div className="about-text">
          <span className="eyebrow">DISCOVER OUR STORY</span>

          <h2>
            More Than Books, <br />
            <span className="about-highlight">A World of Possibilities.</span>
          </h2>

          <p className="about-description">
            Welcome to SaviOmBooks — where every page opens a new world
            of knowledge, imagination and inspiration. We believe books
            help us learn, grow and dream bigger.
          </p>

          <p className="about-description">
            From Fiction and Business to Self-Help, Biography,
            Education and Personal Development, our carefully
            selected collection brings something special for every reader.
          </p>

          <p className="about-description">
            Whether you're a student, professional or passionate reader,
            SaviOmBooks is here to make your reading journey meaningful.
          </p>

          <div className="about-features">
            <div className="about-feature">
              <span className="feature-icon">📚</span>
              <div><h4>Explore More</h4><p>Discover inspiring books</p></div>
            </div>

            <div className="about-feature">
              <span className="feature-icon">💡</span>
              <div><h4>Learn & Grow</h4><p>Knowledge for every journey</p></div>
            </div>
          </div>
        </div>

        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800"
            alt="Beautiful library"
          />
        </div>
      </section>

      <section className="mission-grid">
        <div className="mission-card">
          <div className="mission-icon">🎯</div>
          <h2>Our Mission</h2>
          <p>
            Our mission is to make reading accessible, enjoyable and
            affordable for everyone. We provide a convenient platform
            where readers can discover and purchase their favorite books.
          </p>
        </div>

        <div className="mission-card">
          <div className="mission-icon">🌟</div>
          <h2>Our Vision</h2>
          <p>
            Our vision is to create a community of readers and lifelong
            learners where knowledge is shared and creativity is encouraged.
          </p>
        </div>
      </section>

      <section className="why-choose">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE SAVIOMBOOKS EXPERIENCE</span>
            <h2>Why Choose SaviOmBooks?</h2>
          </div>
        </div>

        <div className="choose-grid">
          <div className="choose-card">
            <span>📚</span>
            <h3>Wide Book Collection</h3>
            <p>Explore books from different genres and categories in one place.</p>
          </div>

          <div className="choose-card">
            <span>💰</span>
            <h3>Affordable Prices</h3>
            <p>Discover great reads at prices that make reading accessible.</p>
          </div>

          <div className="choose-card">
            <span>🚚</span>
            <h3>Convenient Shopping</h3>
            <p>Enjoy an easy online shopping experience.</p>
          </div>

          <div className="choose-card">
            <span>❤️</span>
            <h3>Reader Focused</h3>
            <p>Discover books that inspire and motivate you.</p>
          </div>
        </div>
      </section>

      <section className="about-message">
        <h2>Every Book Has a Story. Every Reader Has a Dream.</h2>
        <p>Start your reading journey with SaviOmBooks.</p>
        <button className="primary-btn" onClick={() => nav("books")}>
          Explore Books →
        </button>
      </section>

    </main>
  );

  // CAREER PAGE

  const Career = () => (
    <main className="container page-pad">

      <section className="about-banner">
        <span>JOIN OUR TEAM</span>
        <h1>Build Your Carrier With Us</h1>
        <p>
          Grow your skills, explore opportunities and become
          part of the SaviOmBooks journey.
        </p>
      </section>

      <section className="career-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CARRIER OPPORTUNITIES</span>
            <h2>Explore Opportunities</h2>
            <p>We are always looking for talented and passionate people.</p>
          </div>
        </div>

        <div className="career-grid">

          <div className="career-card">
            <h3>Frontend Developer</h3>
            <p>Department: Technology</p>
            <p>Skills: React.js, JavaScript, HTML, CSS</p>
            <a href="mailto:careers@saviombooks.com?subject=Frontend Developer Application">
              <button className="primary-btn">Apply Now</button>
            </a>
          </div>

          <div className="career-card">
            <h3>Backend Developer</h3>
            <p>Department: Technology</p>
            <p>Skills: Node.js, Express.js, MongoDB</p>
            <a href="mailto:careers@saviombooks.com?subject=Backend Developer Application">
              <button className="primary-btn">Apply Now</button>
            </a>
          </div>

          <div className="career-card">
            <h3>Digital Marketing Executive</h3>
            <p>Department: Marketing</p>
            <p>Skills: SEO, Social Media, Digital Marketing</p>
            <a href="mailto:careers@saviombooks.com?subject=Digital Marketing Application">
              <button className="primary-btn">Apply Now</button>
            </a>
          </div>

        </div>
      </section>

    </main>
  );

  // MAIN RENDER

  return (
    <>
      <Header />

      {page === "home" ? (
        <Home />
      ) : page === "books" ? (
        <BooksPage />
      ) : page === "cart" ? (
        <CartPage />
      ) : page === "wishlist" ? (
        <WishlistPage />
      ) : page === "orders" ? (
        <OrdersPage />
      ) : page === "seller" ? (
        <Seller />
      ) : page === "account" ? (
        <Account />
      ) : page === "about" ? (
        <About />
      ) : page === "career" ? (
        <Career />
      ) : (
        <Home />
      )}

      <Footer />

      {notice && (
        <div className="toast">
          <CheckCircle size={18} />
          {notice}
        </div>
      )}

      {showAuth && (
        <div className="modal-backdrop" onClick={() => setShowAuth(false)}>
          <form
            className="auth-modal"
            onSubmit={login}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowAuth(false)}
            >
              <X />
            </button>

            <BookOpen size={36} />
            <h2>Welcome to SaviOmBooks</h2>
            <p>Login or create your reader account</p>

            <label>
              Your name
              <input
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder="Enter your name"
              />
            </label>

            <label>
              Email address
              <input
                required
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                required
                type="password"
                minLength="4"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Enter password"
              />
            </label>

            <button className="primary-btn full">
              Continue
            </button>

            <small className="muted">
              Demo sign-in: account data is saved only in this browser.
            </small>
          </form>
        </div>
      )}
    </>
  );
}

export default App;
