import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  BookOpen,
  Code,
  Cpu,
  Users,
  Clock,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F2348] text-white">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <a
                href="/"
                aria-label="Aaklan home"
                className="inline-block mb-4"
              >
                <img
                  src="/logo-light.png"
                  alt="Aaklan logo"
                  className="w-48 h-auto"
                />
              </a>
              <h3 className="sr-only">Aaklan</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                FOR POSSIBLE USE
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                We are a digital coding company for kids up to 12th grade.
                Acklen is devoted to creating a culture of learning where kids
                can learn, create and achieve their dreams.
              </p>
              <div className="flex gap-4 mt-6">
                <a
                  href="https://github.com/KKumarCoder"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub — Krishna Kumar"
                  className="group w-10 h-10 rounded-lg bg-[#E98F0B]/20 hover:bg-[#E98F0B] text-[#E98F0B] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://linkedin.com/in/krishna-kumar-6b5412254"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn — Krishna Kumar"
                  className="group w-10 h-10 rounded-lg bg-[#E98F0B]/20 hover:bg-[#E98F0B] text-[#E98F0B] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X / Twitter"
                  className="group w-10 h-10 rounded-lg bg-[#E98F0B]/20 hover:bg-[#E98F0B] text-[#E98F0B] hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* LINKS Column */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Code className="w-5 h-5 text-[#E98F0B]" />
                LINKS
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Computer & Coding Books (1-8)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Coding, Robotics & AI Books (9-8)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 flex items-center gap-2"
                  >
                    <Code className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Coding, Robotics & AI (Python/Books 9-12)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Online Coding Classes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Online Robotics & AI Classes
                  </a>
                </li>
              </ul>
            </div>

            {/* SUPPORT Column */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E98F0B]" />
                SUPPORT
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Career
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="group text-gray-300 hover:text-[#E98F0B] transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Hours Column */}
            <div>
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#E98F0B]" />
                  ADDRESS
                </h4>
                <ul className="space-y-4">
                  <li className="flex gap-3 group">
                    <Mail className="w-5 h-5 text-[#E98F0B] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <a
                      href="mailto:info@aaklan.com"
                      className="text-gray-300 hover:text-[#E98F0B] transition-colors duration-300"
                    >
                      info@aaklan.com
                    </a>
                  </li>
                  <li className="flex gap-3 group">
                    <Phone className="w-5 h-5 text-[#E98F0B] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <a
                      href="tel:+919571677609"
                      className="text-gray-300 hover:text-[#E98F0B] transition-colors duration-300"
                    >
                      +91 - 9571677609
                    </a>
                  </li>
                  <li className="flex gap-3 pt-1 group">
                    <MapPin className="w-5 h-5 text-[#E98F0B] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-300 group-hover:text-[#E98F0B] transition-colors duration-300">
                      Jaipur - 302026
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E98F0B]" />
                  OPENING HOURS
                </h4>
                <div className="bg-[#1E3A8A]/30 rounded-lg p-4 border border-[#E98F0B]/20">
                  <div className="flex justify-between items-center py-2 border-b border-[#E98F0B]/10">
                    <span className="text-gray-300">Mon-Sat</span>
                    <span className="text-white font-medium">
                      10.00 am - 5.00 pm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Sun</span>
                    <span className="text-red-400 font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#E98F0B]/50 to-transparent my-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E98F0B] to-transparent animate-pulse opacity-20"></div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} All rights reserved |{" "}
              <span className="text-orange-400">
                Aaklan IT Solutions Pvt. Ltd.
              </span>
            </p>

            <div className="flex flex-wrap gap-4 sm:gap-8 justify-center">
              <a
                href="#"
                className="group text-gray-400 hover:text-[#E98F0B] text-sm transition-all duration-300 hover:scale-105"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="group text-gray-400 hover:text-[#E98F0B] text-sm transition-all duration-300 hover:scale-105"
              >
                Terms & Conditions
              </a>
              <a
                href="#"
                className="group text-gray-400 hover:text-[#E98F0B] text-sm transition-all duration-300 hover:scale-105"
              >
                Refund Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
