import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useThemeStore from "../../store/useThemeStore";
import heroImg from "../../assets/hero.png";
import { FaSun, FaMoon, FaCheckCircle } from "react-icons/fa";
import { BackgroundPaths } from "../ui/background-paths";
import { GlowingEffect } from "../ui/glowing-effect";
import { Building2, Zap, BarChart3, Shield, Gem } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.05,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    // Particle Generation
    const particleContainer = document.querySelector(".floating-particles");
    if (particleContainer && particleContainer.children.length === 0) {
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.width = Math.random() * 8 + "px";
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 25 + "s";
        particleContainer.appendChild(particle);
      }
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Super Admin Control",
      description: "Elite oversight of driver payments, agent commissions, and system-wide financial integrity.",
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      title: "Sub Admin Efficiency",
      description: "Streamlined local operations for user registration and rapid QR-based asset management.",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: "Precision Analytics",
      description: "High-fidelity data visualizations monitoring real-time transport fleet performance.",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      title: "Secure Verification",
      description: "State-of-the-art QR authentication protocols ensuring zero-friction digital transactions.",
      icon: <Shield className="h-6 w-6" />,
    }
  ];

  return (
    <div className="landing-page">
      <div className="floating-particles"></div>
      <nav className="landing-nav glass">
        <div className="logo gradient-text">Yegna Taxi Admin</div>
        <div className="landing-nav-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <span style={{ fontSize: "16px", display: "flex", alignItems: "center" }}><FaSun /></span>
            ) : (
              <span style={{ fontSize: "16px", display: "flex", alignItems: "center" }}><FaMoon /></span>
            )}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/login")}>
            Portal Login
          </button>
        </div>
      </nav>

      <section className="hero" style={{ position: 'relative', padding: 0, margin: 0 }}>
        <BackgroundPaths 
          title="Premium Fleet & Payment Management" 
          onButtonClick={() => navigate("/login")}
        />
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '40px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 20, 
            display: 'flex', 
            gap: '30px', 
            padding: '20px 40px', 
            borderRadius: '16px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="reveal scale-up" style={{ transitionDelay: '200ms' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-yellow)' }}>500+</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Active Fleet</div>
          </div>
          <div className="reveal scale-up" style={{ transitionDelay: '400ms' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-yellow)' }}>10k+</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Daily Trips</div>
          </div>
          <div className="reveal scale-up" style={{ transitionDelay: '600ms' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-yellow)' }}>100%</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Uptime</div>
          </div>
        </div>
      </section>

      <section className="features reveal fade-bottom">
        <div style={{ maxWidth: '800px', margin: '0 auto 80px', textAlign: 'center' }}>
          <h2 className="gradient-text-yellow" style={{ fontSize: '3rem', marginBottom: '20px' }}>Unified Network Control</h2>
          <p style={{ fontSize: '1.2rem' }}>
            Our comprehensive administrative suite provides specialized tools for every level
            of your transport network hierarchy.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="reveal fade-bottom" 
              style={{ 
                transitionDelay: `${index * 200}ms`,
                minHeight: '280px',
                listStyle: 'none'
              }}
            >
              <div 
                className="feature-card rounded-[1.25rem] md:rounded-[1.5rem]" 
                style={{ 
                  position: 'relative',
                  height: '100%',
                  border: '0.75px solid var(--border-color)',
                  padding: '8px',
                  overflow: 'hidden'
                }}
              >
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                  blur={0}
                />
                <div 
                  className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl"
                  style={{ 
                    background: 'var(--surface-color)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '0.75px solid var(--border-color)',
                    boxShadow: 'var(--card-shadow)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <div 
                      style={{ 
                        width: 'fit-content',
                        borderRadius: '12px',
                        border: '0.75px solid var(--border-color)',
                        background: 'rgba(250, 204, 21, 0.1)',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-yellow)'
                      }}
                    >
                      {feature.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 
                        style={{ 
                          margin: 0,
                          paddingTop: '4px',
                          fontSize: '20px',
                          lineHeight: '1.375rem',
                          fontWeight: '600',
                          letterSpacing: '-0.04em',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p 
                        style={{ 
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.25rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="benefits-section reveal fade-left" style={{ padding: '80px 8%', background: 'var(--surface-color)', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', flexDirection: 'row-reverse' }}>
          <div style={{ flex: 1 }}>
            <h2 className="gradient-text-yellow" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Why Leading Fleets Choose Yegna</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                "Enterprise-Grade Security & Encryption",
                "Real-Time Financial Reconciliation",
                "Automated Agent Commission payouts",
                "Seamless QR Code Asset Management",
                "24/7 Operational Uptime Guarantee"
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                  <FaCheckCircle style={{ color: 'var(--accent-yellow)', fontSize: '1.2em' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="reveal scale-up" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div className="glass" style={{ padding: '40px', borderRadius: '32px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
              <div style={{ fontSize: '100px', color: 'var(--primary-color)', opacity: 0.8, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Gem size={100} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Unmatched Quality</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section reveal fade-bottom">
        <div className="cta-box glass" style={{ background: 'linear-gradient(135deg, #1e3a8a, #030712)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="hero-glow" style={{ top: '-10%', right: '-5%', width: '300px', height: '300px' }}></div>
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '20px' }}>Orchestrate Your Fleet Operations</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>Secure, fast, and intelligent transport administration designed for the next generation of shared transport.</p>
          <button
            className="btn btn-primary"
            style={{
              background: 'white',
              color: '#1e3a8a',
              padding: '18px 48px',
              fontSize: '18px',
              borderRadius: '16px'
            }}
            onClick={() => navigate("/login")}
          >
            Launch Admin Center
          </button>
        </div>
      </section>

      <footer className="landing-footer reveal">
        <div style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>Yegna Taxi Admin</div>
        <p>&copy; {new Date().getFullYear()} Yegna Taxi Digital Transport Solutions. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Support</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
