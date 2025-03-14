import { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  UserCog,
  ShoppingCart,
  Home,
  Image,
  Phone,
} from "lucide-react";
import AuthContext from "../hooks/AuthContext";
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (user) {
        try {
          const response = await axios.get("/api/cart/count", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setCartCount(response.data.count);
        } catch (error) {
          console.error("Error fetching cart count:", error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home, current: location.pathname === "/" },
    {
      name: "Products",
      href: "/products",
      icon: Image,
      current: location.pathname.startsWith("/products"),
    },
    {
      name: "About",
      href: "/about",
      icon: User,
      current: location.pathname === "/about",
    },
    {
      name: "Contact",
      href: "/contact",
      icon: Phone,
      current: location.pathname === "/contact",
    },
    ...(user
      ? [
          user.isAdmin
            ? {
                name: "Admin Dashboard",
                href: "/admin/dashboard",
                icon: UserCog,
                current: location.pathname.startsWith("/admin"),
              }
            : {
                name: "Dashboard",
                href: "/dashboard",
                icon: User,
                current: location.pathname === "/dashboard",
              },
          {
            name: "Logout",
            href: "#",
            icon: LogOut,
            onClick: handleLogout,
            current: false,
          },
        ]
      : [
          {
            name: "Login",
            href: "/auth",
            icon: User,
            current: location.pathname === "/auth",
          },
        ]),
  ];

  const NavLinks = ({ isMobile }) => {
    const closeMobileMenu = () => {
      setIsOpen(false);
    };

    const linkClasses = isMobile
      ? `flex items-center py-3 px-4 hover:bg-green-100 w-full text-left text-gray-700 transition-all duration-300 border-l-4 border-transparent hover:border-green-500`
      : "flex items-center space-x-1 px-4 py-2.5 rounded-full hover:bg-green-500/10 hover:text-green-700 transition-all duration-300 relative group";

    const desktopActiveClass = !isMobile
      ? "bg-green-500/10 text-green-700 font-medium after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-green-500 after:rounded-full after:animate-pulse"
      : "";

    return (
      <>
        {navigation.map((item) => (
          <li key={item.name} className={isMobile ? "w-full" : "relative"}>
            {item.onClick ? (
              <button
                onClick={() => {
                  item.onClick();
                  closeMobileMenu();
                }}
                className={`${linkClasses} ${
                  item.current && !isMobile ? desktopActiveClass : ""
                }`}
              >
                {item.icon && <item.icon className="w-5 h-5 mr-2" />}
                <span>{item.name}</span>
                {!isMobile && (
                  <span className="absolute inset-0 rounded-full bg-green-500/0 group-hover:bg-green-500/5 transition-colors duration-300"></span>
                )}
              </button>
            ) : (
              <NavLink
                to={item.href}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `${linkClasses} ${
                    (isActive || item.current) && !isMobile
                      ? desktopActiveClass
                      : ""
                  }`
                }
              >
                {item.icon && <item.icon className="w-5 h-5 mr-2" />}
                <span>{item.name}</span>
                {!isMobile && (
                  <span className="absolute inset-0 rounded-full bg-green-500/0 group-hover:bg-green-500/5 transition-colors duration-300"></span>
                )}
              </NavLink>
            )}
          </li>
        ))}
      </>
    );
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 top-0 left-0 right-0 ${
        scrolled
          ? "bg-white shadow-lg py-2"
          : "bg-white/90 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r font-playfair from-green-600 to-green-400 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-green-200/50 transition-all duration-300 group-hover:scale-105">
                AG
              </div>
              <span className="ml-3 text-xl font-bold text-gray-800 tracking-tight">
                <span className="text-green-600 font-playfair">Amruta's</span> <span className="font-playfair">Art Gallery</span>
              </span>
            </NavLink>
          </div>

          <div className="hidden md:block">
            <ul className="flex items-center space-x-1">
              <NavLinks />
            </ul>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <NavLink
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-green-600 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/profile"
                  className="relative flex items-center justify-center"
                  aria-label="User Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </NavLink>
              </>
            )}

            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <ul className="flex flex-col py-2">
            <NavLinks isMobile={true} />
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
