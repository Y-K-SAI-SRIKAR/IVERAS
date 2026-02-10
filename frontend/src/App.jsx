import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Beams from './components/Beams';
import Shuffle from './components/Shuffle';
import ShinyText from './components/ShinyText';
import GradientText from './components/GradientText';
import TargetCursor from './components/TargetCursor';
import TrueFocus from './components/TrueFocus';
import DecryptedText from './components/DecryptedText';
import SplitText from './components/SplitText';
import SparkleButton from './components/SparkleButton';
import CountUp from './components/CountUp';
import Srikar from './components/Srikar';
import Rags from './components/Rags';
import Prasanna from './components/Prasanna';
import Kavya from './components/Kavya';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';
import LogoLoop from './components/LogoLoop';
import AnimatedContent from './components/AnimatedContent.jsx';
import { SiReact, SiFastapi } from 'react-icons/si';
import { FaAws, FaRaspberryPi, FaLinux, FaDocker, FaPython, FaJava } from "react-icons/fa";
import ExploreButton from './components/ExploreButton';
import Lifecycle from './components/Lifecycle';
import GetStarted from './components/GetStarted';
import ThemeSwitch from './components/ThemeSwitch';
import LoginButton from './components/LoginButton';
import RegisterButton from './components/RegisterButton';
import LoginPage from './pages/LoginPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import AdminDashboard from './pages/AdminDashboard';


const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <FaAws />, title: 'Aws', href: '' },
  { node: <FaRaspberryPi />, title: 'RaspBerryPi', href: '' },
  { node: <FaLinux />, title: 'Linux', href: '' },
  { node: <FaDocker />, title: 'Docker', href: '' },
  { node: <FaPython />, title: 'Python', href: '' },
  { node: <FaJava />, title: 'Java', href: '' },
  { node: <SiFastapi />, title: 'FastAPI', href: '' },
];

function App() {
  const [showTitle, setShowTitle] = useState(false);
  const [startCounter, setStartCounter] = useState(false);
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTitle(true);
      setStartCounter(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerate = () => {
    console.log('Generating site...');
  };

  // NEW: common register route (same for GetStarted and Register button)
  const REGISTER_ROUTE = '/register';

  const handleGetStarted = () => {
    console.log('Get Started clicked');
    navigate(REGISTER_ROUTE);
  };

  const handleLogin = () => {
    console.log('Navigating to login page');
    navigate('/LoginPage');
  };

  const handleRegister = () => {
    console.log('Register button clicked');
    navigate(REGISTER_ROUTE);
  };

  const handleExplore = () => {
    console.log('Navigating to explore page');
    navigate('/ExplorePage');
  };

  const pageBackground = dark ? '#000000' : '#101018';
  const textColor = dark ? '#ffffff' : '#e5e7eb';

  return (
    <div
      id="app-root"
      style={{
        width: '100%',
        minHeight: '100vh',
        padding: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        backgroundColor: pageBackground,
        color: textColor,
        position: 'relative',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      {/* BEAMS BACKGROUND */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: dark ? 1 : 0.6,
          transition: 'opacity 0.4s ease',
        }}
      >
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={25}
          lightColor={dark ? '#ffffff' : '#d1d5db'}
          speed={1.2}
          noiseIntensity={1.75}
          scale={0.25}
          rotation={30}
        />
      </div>

      {/* CONTENT WRAPPER */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* TOP BAR WITH THEME SWITCH + LOGIN + REGISTER */}
        <header
          style={{
            width: '100%',
            padding: '16px 32px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeSwitch
              checked={dark}
              onChange={(e) => setDark(e.target.checked)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <LoginButton onClick={handleLogin} />
            <RegisterButton text="GET ACCESS" onClick={handleRegister} />
          </div>
        </header>

        {/* HERO */}
        <section
          style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: '10vh',
            paddingBottom: '0',
            textAlign: 'center',
          }}
        >
          <div
            className="cursor-target"
            style={{
              fontSize: '3.5rem',
              fontWeight: '900',
              letterSpacing: '6px',
              fontFamily: '"Poppins", "Montserrat", "Segoe UI", sans-serif',
              textTransform: 'uppercase',
            }}
          >
            {showTitle && <Shuffle text="TEAM PADMA VYUHA" triggerOnce />}
          </div>
          <div className="cursor-target" style={{ marginTop: '2px' }}>
            <TrueFocus
              sentence="PRESENTS I.V.E.R.A.S"
              manualMode={false}
              blurAmount={5}
              borderColor="#dbdbdc"
              animationDuration={0.5}
              pauseBetweenAnimations={1}
            />
          </div>
          <div
            className="cursor-target"
            style={{
              marginTop: '3px',
              fontSize: '1.2rem',
              fontWeight: '600',
              letterSpacing: '1px',
              background:
                'linear-gradient(90deg,#FFD700,#FFF4B5,#FFC400,#FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <DecryptedText
              text="Intelligent Vehicle Emergency Response and Assistance System"
              animateOn="view"
              revealDirection="start"
              sequential
              speed={75}
              maxIterations={10}
            />
          </div>
          <div
            className="cursor-target"
            style={{
              marginTop: '0px',
              fontSize: '1rem',
              fontWeight: '700',
            }}
          >
            <SplitText
              text="Saving Lives, One Second At A Time !"
              delay={45}
              duration={1.2}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="center"
            />
          </div>
        </section>

        {/* TARGET CURSOR */}
        <TargetCursor
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.2}
          enabled={cursorEnabled}
        />

        {/* COUNTUP */}
        <section
          style={{
            marginTop: '-40px',
            marginBottom: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="cursor-target"
            style={{
              fontSize: '2rem',
              fontWeight: '750',
              letterSpacing: '2px',
            }}
          >
            Don't Let{' '}
            <span
              style={{
                background: 'linear-gradient(90deg,#FFD700,#FFF,#FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '900',
                fontSize: '2.1rem',
              }}
            >
              <CountUp
                from={0}
                to={485}
                separator=","
                direction="up"
                duration={30}
                startCounting={startCounter}
              />
            </span>{' '}
            Just Be A Number, Make It A Reason For A Change !!
          </div>
        </section>

        {/* LIFECYCLE TIMELINE */}
        <section
          style={{
            width: '100%',
            position: 'relative',
          }}
        >
          <Lifecycle />
        </section>

        {/* SCROLL STACK */}
        <section
          style={{
            width: '100%',
            maxWidth: '1200px',
            minHeight: '100vh',
            margin: '0 auto',
            position: 'relative',
          }}
          className="scroll-stack"
          onMouseEnter={() => setCursorEnabled(false)}
          onMouseLeave={() => setCursorEnabled(true)}
        >
          <ScrollStack itemDistance={35}>
            <AnimatedContent
              distance={100}
              direction="vertical"
              reverse={false}
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={0}
            >
              <ScrollStackItem>
                <div
                  className="cursor-target scroll-stack-card-content"
                  style={{
                    padding: '50px 30px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                  }}
                >
                  <h2 style={{ marginBottom: '6px', fontSize: '1.7rem' }}>
                    OUR VISION
                  </h2>
                  <p>
                    IVERAS was born out of a refusal to compromise.
                    Our mission is to engineer a safety net that spans the nation,
                    using cutting-edge innovation to outpace human error.
                    We are not just building a project; we are building a shield.
                    We are rewriting the narrative of Indian roads from one of risk to
                    one of assurance.
                  </p>
                </div>
              </ScrollStackItem>
            </AnimatedContent>

            <AnimatedContent
              distance={100}
              direction="vertical"
              reverse={false}
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={0.1}
            >
              <ScrollStackItem>
                <div
                  className="cursor-target scroll-stack-card-content"
                  style={{
                    padding: '50px 30px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                  }}
                >
                  <h2 style={{ marginBottom: '6px', fontSize: '1.7rem' }}>
                    OUR MISSION
                  </h2>
                  <p>
                    Every Second Counts Every day in India, the sun sets on 485 lives lost to road accidents.
                    That is 485 futures erased and countless families shattered.
                    The gap between an accident and a rescue is where lives are lost, and that is exactly where IVERAS steps in.
                  </p>
                  <p>
                    485 reasons today. 485 reasons tomorrow. One solution: IVERAS.
                  </p>
                </div>
              </ScrollStackItem>
            </AnimatedContent>

            <AnimatedContent
              distance={100}
              direction="vertical"
              reverse={false}
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={0.2}
            >
              <ScrollStackItem>
                <div
                  className="cursor-target scroll-stack-card-content"
                  style={{
                    padding: '50px 30px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                  }}
                >
                  <h2 style={{ marginBottom: '6px', fontSize: '1.7rem' }}>
                    SAFETY IS NOT LUXURY
                  </h2>
                  <p>
                    At IVERAS, we believe that safety is not a luxury—it is a fundamental right.
                    We are building a future where technology acts as a guardian, intervening the moment danger strikes.
                    We are driven by the belief that even one life saved changes the world for an entire family.
                  </p>
                </div>
              </ScrollStackItem>
            </AnimatedContent>

            <AnimatedContent
              distance={100}
              direction="vertical"
              reverse={false}
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={0.3}
            >
              <ScrollStackItem>
                <div
                  className="cursor-target scroll-stack-card-content"
                  style={{
                    padding: '50px 30px',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                  }}
                >
                  <h2 style={{ marginBottom: '7px', fontSize: '1.7rem' }}>
                    THE SILENT LEFT BEHIND
                  </h2>
                  <p>
                    Beyond the Statistics In India, the road is often a lifeline, but for too many, it becomes a tragedy.
                    We often hear the numbers, but we rarely feel the silence left behind in 485 homes, every single day.
                    These aren't just data points on a government chart; they represent fathers, mothers, children, and friends whose journeys were cut short.
                  </p>
                </div>
              </ScrollStackItem>
            </AnimatedContent>
          </ScrollStack>
        </section>

        {/* BUTTON */}
        <section
          style={{
            marginBottom: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <div
            className="cursor-target"
            style={{
              fontSize: '1.7rem',
              fontWeight: '600',
              letterSpacing: '1px',
            }}
          >
            Curious About IVERAS ?... 😉
          </div>
          <SparkleButton onClick={handleGenerate} />
        </section>

        {/* LOGO LOOP */}
        <section
          style={{
            width: '100%',
            height: '90px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '40px',
          }}
          className="cursor-target"
        >
          <div className="logo-loop">
            <LogoLoop
              logos={techLogos}
              speed={50}
              direction="left"
              logoHeight={50}
              gap={50}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor={dark ? '#000000' : '#030712'}
              ariaLabel="Technology stack"
            />
          </div>
        </section>

        {/* GET STARTED BUTTON */}
        <section
          style={{
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GetStarted onClick={handleGetStarted} />
        </section>

        {/* TEAM TITLE */}
        <section
          style={{
            paddingBottom: '20px',
            textAlign: 'center',
          }}
        >
          <div className="cursor-target">
            <GradientText
              colors={['#5227FF', '#FF9FFC', '#B19EEF']}
              animationSpeed={12}
              showBorder={false}
            >
              <span
                style={{
                  fontSize: '1.8rem',
                  fontWeight: '800',
                  letterSpacing: '3px',
                }}
              >
                ✨ Meet Our Team ✨
              </span>
            </GradientText>
          </div>
        </section>

        {/* TEAM CARDS */}
        <section
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            padding: '4px 0 6px',
            flexWrap: 'wrap',
          }}
        >
          <div className="cursor-target">
            <Rags />
          </div>
          <div className="cursor-target">
            <Srikar />
          </div>
          <div className="cursor-target">
            <Prasanna />
          </div>
          <div className="cursor-target">
            <Kavya />
          </div>
        </section>

        {/* FOOTER */}
        <section
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px 0 0',
            marginBottom: 90,
          }}
        >
          <div
            className="cursor-target"
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              letterSpacing: '2px',
            }}
          >
            <ShinyText
              text="✨ Together We Achieve More ✨"
              speed={2}
              color="#888"
              shineColor="#ffffff"
              spread={140}
              direction="left"
            />
          </div>
        </section>

        {/* EXPLORE BUTTON */}
        <section
          style={{
            marginTop: '-70px',
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            className="cursor-target"
            style={{
              fontSize: '3rem',
              fontWeight: '1000',
              letterSpacing: '1px',
            }}
          >
          </div>

          <ExploreButton onClick={handleExplore}>
            Explore OUR Contribution towards IVERAS
          </ExploreButton>
        </section>
      </div>
    </div>
  );
}

export default App;
