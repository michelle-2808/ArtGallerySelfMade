import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, LogOut, ShoppingCart, User, UserCog } from "lucide-react";
import AuthContext from "../hooks/AuthContext"; // Import AuthContext
import { useContext } from "react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect using navigate (if you have access to it) or window.location
      window.location.href = "/"; // Or '/auth' if you prefer to go to the login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const NavLinks = ({ isMobile }) => {
    const linkClasses = isMobile
      ? "block py-2 px-4 text-white hover:bg-gray-700 w-full text-left" // Mobile styles
      : "hover:text-gray-300 transition-colors"; // Desktop styles

    return (
      <>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? "border-b-2 border-white" : ""}`
          }
          onClick={closeMobileMenu}
        >
          Home
        </NavLink>
        {user ? (
          <>
            {user.isAdmin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${linkClasses} ${isActive ? "border-b-2 border-white" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <UserCog className="mr-2 h-4 w-4 inline-block" />{" "}
                {/* Icon for Admin */}
                Admin Dashboard
              </NavLink>
            ) : (
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `${linkClasses} ${isActive ? "border-b-2 border-white" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <ShoppingCart className="mr-2 h-4 w-4 inline-block" /> Cart
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? "border-b-2 border-white" : ""}`
              }
              onClick={closeMobileMenu}
            >
              <User className="mr-2 h-4 w-4 inline-block" /> Profile
            </NavLink>
            <button
              className={`${linkClasses} flex items-center`} // Use flex for icon alignment
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/auth"
            className={({ isActive }) =>
              `bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600 ${
                isActive ? "border-b-2 border-white" : ""
              }`
            }
            onClick={closeMobileMenu}
          >
            Login
          </NavLink>
        )}
      </>
    );
  };

  return (
    <nav className="h-16 bg-gray-900 text-white px-6 flex justify-between items-center shadow-lg">
      <NavLink to="/" className="text-2xl font-bold">
        My App
      </NavLink>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex space-x-6">
        <NavLinks isMobile={false} />
      </ul>

      {/* Mobile Navigation (Hamburger Menu) */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="text-white hover:text-gray-300 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile Menu (Sliding Panel) */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50"
            onClick={closeMobileMenu}
          >
            <div
              className="absolute top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 transform transition-transform duration-300 ease-in-out"
              style={{
                transform: isMobileMenuOpen
                  ? "translateX(0)"
                  : "translateX(-100%)",
              }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside the menu from closing it
            >
              <button
                onClick={closeMobileMenu}
                className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              >
                {/* Close Icon (X) - You can use lucide-react for this if you want */}
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
              <ul className="mt-16">
                <NavLinks isMobile={true} />
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
