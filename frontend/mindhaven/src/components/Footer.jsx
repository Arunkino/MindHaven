function Footer() {
    return (
      <footer className="bg-custom-bg text-white py-4 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p>&copy; 2024 Mind Haven. All rights reserved.</p>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/privacy" className="hover:text-custom-accent">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-custom-accent">Terms of Service</a></li>
            </ul>
          </nav>
        </div>
      </footer>
    );
  }
  
  export default Footer;