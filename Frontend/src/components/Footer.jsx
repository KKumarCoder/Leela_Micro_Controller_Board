import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Rocket,
  Globe,
  BookOpen,
  Cpu,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0F2348] text-white relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#E98F0B]/10 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative z-10">
        
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* BRAND */}
          <div>
            <img
              src="/logo-light.png"
              alt="Aaklan Logo"
              className="w-48 mb-5"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              We are a digital coding company inspiring students from beginners
              to advanced level with modern coding, robotics & AI education.
            </p>

            {/* Social */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://github.com/KKumarCoder"
                target="_blank"
                className="w-10 h-10 flex items-center justify-center bg-[#E98F0B]/20 rounded-lg text-[#E98F0B] hover:bg-[#E98F0B] hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/krishna-kumar-6b5412254"
                target="_blank"
                className="w-10 h-10 flex items-center justify-center bg-[#E98F0B]/20 rounded-lg text-[#E98F0B] hover:bg-[#E98F0B] hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                className="w-10 h-10 flex items-center justify-center bg-[#E98F0B]/20 rounded-lg text-[#E98F0B] hover:bg-[#E98F0B] hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* QUICK NAVIGATION */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#E98F0B]" />
              Quick Navigation
            </h3>

            <ul className="text-gray-300 space-y-3">
              {[
                "Home",
                "About Us",
                "Courses",
                "Robotics & AI",
                "Blogs",
                "Contact",
              ].map((item) => (
                <li key={item}>
                  <a className="hover:text-[#E98F0B] transition-all hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* OUR SERVICES */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E98F0B]" />
              Our Services
            </h3>

            <ul className="text-gray-300 space-y-3">
              {[
                "Coding for Kids",
                "Robotics & AI Programs",
                "Online Live Classes",
                "School Coding Curriculum",
                "Workshops & Bootcamps",
              ].map((item) => (
                <li key={item}>
                  <a className="hover:text-[#E98F0B] transition-all hover:translate-x-1 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E98F0B]" />
              Contact Info
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#E98F0B]" />
                <a
                  href="mailto:info@aaklan.com"
                  className="text-gray-300 hover:text-[#E98F0B]"
                >
                  info@aaklan.com
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#E98F0B]" />
                <a
                  href="tel:+919571677609"
                  className="text-gray-300 hover:text-[#E98F0B]"
                >
                  +91 - 9571677609
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E98F0B]" />
                <span className="text-gray-300">Jaipur - 302026</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#E98F0B]/50 to-transparent my-12"></div>

        {/* BOTTOM */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
          <p className="text-gray-400 text-sm">
            © {year} All rights reserved |
            <span className="text-[#E98F0B]"> Aaklan IT Solutions Pvt. Ltd.</span>
          </p>

          <div className="flex gap-6 text-sm">
            <a className="text-gray-400 hover:text-[#E98F0B] transition-all">
              Privacy Policy
            </a>
            <a className="text-gray-400 hover:text-[#E98F0B] transition-all">
              Terms & Conditions
            </a>
            <a className="text-gray-400 hover:text-[#E98F0B] transition-all">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
