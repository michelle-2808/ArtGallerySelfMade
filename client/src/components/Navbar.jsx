import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, LogOut, User, UserCog } from "lucide-react"; // Import only necessary icons
import AuthContext from "../hooks/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const navigation = [
    { name: "Home", href: "/", current: true },
    ...(user
      ? [
          user.isAdmin
            ? {
                name: "Admin Dashboard",
                href: "/dashboard",
                current: false
                
              }
            : {
                name: "Dashboard",
                href: "/dashboard",
                current: false,
                icon: User,
              },
          { name: "Logout", href: "#", onClick: handleLogout },
        ]
      : [{ name: "Login", href: "/auth", current: false }]),
  ];

  const NavLinks = ({ isMobile, nav }) => {
    const closeMobileMenu = () => {
      setIsMobileMenuOpen(false);
    };

    const linkClasses = isMobile
      ? `block py-2 px-4 hover:bg-green-100 w-full text-left text-gray-700` // Mobile styles, green hover
      : "hover:text-green-700 transition-colors"; // Desktop styles, green hover

    return (
      <>
        {nav.map((item) => (
          <div key={item.name} className="relative group">
            {item.href && item.name !== "Logout" ? (
              <NavLink
                to={item.href}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `${linkClasses} ${
                    isActive
                      ? "border-b-2 border-green-600 font-semibold text-green-700"
                      : ""
                  }`
                }
              >
                {" "}
                <span className="text-l font-bold font-playfair  text-black-500">
                  {item.name}
                </span>
              </NavLink>
            ) : (
              <button
                className={`${linkClasses} flex items-center w-full`}
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  handleLogout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </button>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <nav className="bg-white text-gray-800 shadow-md h-16 px-6 flex items-center justify-between">
      <NavLink to="/" className="flex items-center">
        <span className="text-2xl font-bold font-playfair  text-black-500  px-2 md:px-20">
          Amruta's Art Gallery
        </span>
      </NavLink>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex space-x-6">
        <NavLinks isMobile={false} nav={navigation} />
      </ul>

      {/* Mobile Navigation (Hamburger Menu) */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-700 hover:text-green-600 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="absolute top-0 right-0 h-full w-64 bg-white text-gray-700 p-4 transform transition-transform duration-300 ease-in-out"
              style={{
                transform: isMobileMenuOpen
                  ? "translateX(0)"
                  : "translateX(100%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-green-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="mt-16 space-y-2">
                <NavLinks isMobile={true} nav={navigation} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
