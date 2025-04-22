"use client"
import { motion } from 'framer-motion';
import { FaLinkedin, FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const ApplicationTimeline = () => {
  const steps = [
    {
      title: "Application Review",
      description: "Our HR team will carefully review your application within 3-5 business days. You'll receive an email confirmation once your application is processed.",
      duration: "3-5 business days",
      icon: "📋"
    },
    {
      title: "Candidate Selection",
      description: "If your profile matches our requirements, you'll be shortlisted for the next stage. We'll contact you via email or phone to schedule an interview.",
      duration: "1-2 weeks",
      icon: "✅"
    },
    {
      title: "Interview Process",
      description: "You'll participate in one or more interviews (technical and/or HR). For some positions, you may be asked to complete a skills assessment.",
      duration: "Varies by role",
      icon: "💬"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            What Happens After You Apply
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Our transparent hiring process ensures you're informed at every stage
          </motion.p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 h-full w-1 bg-blue-100 transform -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
              >
                {/* For even items (left side) */}
                {index % 2 === 0 && (
                  <>
                    <div className="md:w-1/2 md:pr-10 mb-6 md:mb-0">
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="text-3xl mb-3">{step.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="text-sm text-blue-600 font-medium">
                          <span className="mr-2">⏱️</span> {step.duration}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex md:w-1/2 md:pl-10 justify-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-md"></div>
                    </div>
                  </>
                )}

                {/* For odd items (right side) */}
                {index % 2 !== 0 && (
                  <>
                    <div className="hidden md:flex md:w-1/2 md:pr-10 justify-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-md"></div>
                    </div>
                    <div className="md:w-1/2 md:pl-10 mb-6 md:mb-0">
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="text-3xl mb-3">{step.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="text-sm text-blue-600 font-medium">
                          <span className="mr-2">⏱️</span> {step.duration}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact and Social Media */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t border-gray-200"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Stay Connected With Us</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Follow us on social media for job updates, career tips, and company news
            </p>
            
            <div className="flex justify-center space-x-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-700 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-6 h-6" />
              </a>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>Have questions? <a href="mailto:careers@example.com" className="text-blue-600 hover:underline">careers@example.com</a></p>
              <p className="mt-1">Or call us: <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1 (234) 567-890</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ApplicationTimeline;