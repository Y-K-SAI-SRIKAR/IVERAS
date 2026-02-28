// ExplorePage.jsx
import React, { useEffect } from "react";
import Squares from "../PagesUI/Squares.jsx";
import "../PagesUI/Squares.css";
import CircularText from "../PagesUI/CircularText.jsx";
import "../PagesUI/CircularText.css";
import SpotlightCard from "../PagesUI/SpotlightCard.jsx";
import "../PagesUI/SpotlightCard.css";
import TextType from "../PagesUI/TextType.jsx";
import "../PagesUI/TextType.css";
import AnimatedContent from "../PagesUI/AnimatedContent.jsx";

const ExplorePage = () => {
  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const container = document.getElementById("app-root");
    if (container) {
      container.scrollTop = 0;
    }
  }, []);

  return (
    <div style={styles.wrapper}>
      {/* Background squares */}
      <div style={styles.background}>
        <Squares
          speed={0.5}
          size={40}
          direction="diagonal"
          borderColor="#271E37"
          hoverColor="#222222"
        />
      </div>

      {/* Page content + footer (scrolls normally) */}
      <div style={styles.content}>
        <h1 style={styles.heading}>THE IVERAS COMMUNITY</h1>

        {/* Typing effect above cards */}
        <div style={styles.typingWrapper}>
          <TextType
            text={[
              "Building Intelligent Emergency Response Systems.",
              "Connecting Vehicles, Through Cloud, and Automation.",
              "Driven by Innovation. Focused on Saving Lives.",
              "Welcome to the IVERAS community!",
              "Explore how each member powers this mission.",
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor
            cursorCharacter="_"
            deletingSpeed={50}
            variableSpeedEnabled={false}
            variableSpeedMin={60}
            variableSpeedMax={120}
            cursorBlinkDuration={0.5}
          />
        </div>

        {/* Spotlight cards with scroll animations */}
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
          <div style={styles.cardWrapper}>
            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h2>Sreenivasan Venkata Raghavan</h2>
              <h3>Founder & Project Lead</h3>
              <p>
                I lead the overall technical direction and system architecture of
                IVERAS. I design and establish the complete hardware
                infrastructure, integrating ESP32-based vehicle modules and a
                Raspberry Pi – powered automated ambulance. I ensure reliable
                real-time data flow between sensors, embedded controllers, and
                cloud services to maintain system stability and responsiveness.
              </p>
              <p>
                I develop and optimize YOLO v8 - based computer vision models for
                intelligent path planning, obstacle detection, and route
                optimization. I continuously evaluate system performance under
                dynamic and time-critical conditions, ensuring that IVERAS meets
                reliability, safety, and scalability requirements for real-world
                emergency response scenarios.
              </p>
            </SpotlightCard>
          </div>
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
          <div style={styles.cardWrapper}>
            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h2>Konduri Lakshmi Prasanna</h2>
              <h3>Co-Founder & Vice Project Lead</h3>
              <p>
                I lead website development, workflow management, and user
                experience design for IVERAS. I design intuitive frontend
                workflows that align with real-time system operations and user
                needs. I focus on creating a consistent, accessible, and efficient
                user experience for operators, administrators, and stakeholders.
              </p>
              <p>
                I manage database integration and workflow coordination to ensure
                accurate data storage, retrieval, and visualization. I
                continuously refine user interactions and system workflows to
                improve usability, clarity, and operational efficiency across the
                platform.
              </p>
            </SpotlightCard>
          </div>
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
          <div style={styles.cardWrapper}>
            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h2>Kotagiri Kavya Sri</h2>
              <h3>Co-Founder – Databases & Web Systems</h3>
              <p>
                I design and manage the database architecture that supports the
                IVERAS platform. I ensure data integrity, performance
                optimization, and scalability for real-time data ingestion and
                retrieval. I focus on building structured and reliable data
                systems that support continuous system operation and future
                expansion.
              </p>
              <p>
                I also contribute to website development, ensuring seamless
                interaction between backend services and the user interface. I
                work to ensure that system data is presented accurately,
                efficiently, and without latency, supporting both operational
                monitoring and analytical use cases.
              </p>
            </SpotlightCard>
          </div>
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
          <div style={styles.cardWrapper}>
            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h2>Yerraguntla Kameswara Sai Srikar</h2>
              <h3>Co-Founder – Automation, Cloud & AI Systems</h3>
              <p>
                I design and implement the automation and cloud infrastructure
                that supports the IVERAS platform. I deploy scalable cloud
                services for real-time data processing, monitoring, and
                orchestration. I automate deployment pipelines and system
                workflows to ensure high availability, reliability, and rapid
                scalability.
              </p>
              <p>
                I develop AI agents that assist in system coordination, decision
                support, and operational optimization. I also design and implement
                the website's user interface, focusing on clarity, performance,
                and usability. I translate complex system intelligence into
                intuitive visual insights that enable effective monitoring and
                control.
              </p>
            </SpotlightCard>
          </div>
        </AnimatedContent>

        {/* Footer with CircularText animation */}
        <footer style={styles.footer}>
          <div style={styles.circularTextWrapper}>
            <CircularText
              text="TEAM*PADMA*VYUHA*"
              spinDuration={25}
              startAngle={-90}
              className="custom-class"
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    overflow: "visible",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 1,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.3rem",
    width: "100%",
    padding: "2rem 1rem 3rem",
    boxSizing: "border-box",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "0.75rem",
    textAlign: "center",
  },
  typingWrapper: {
    marginBottom: "1.5rem",
    textAlign: "center",
    maxWidth: "900px",
    fontSize: "1.5rem",
    lineHeight: 1.5,
  },
  cardWrapper: {
    position: "relative",
    width: "100%",
    padding: "2px",
    background: "linear-gradient(135deg, rgba(0, 229, 255, 0.5), rgba(138, 43, 226, 0.5), rgba(0, 229, 255, 0.3))",
    borderRadius: "16px",
    boxShadow: "0 0 20px rgba(0, 229, 255, 0.3), 0 0 40px rgba(138, 43, 226, 0.2)",
  },
  footer: {
    marginTop: "2rem",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 10,
  },
  circularTextWrapper: {
    position: "relative",
    transform: "translateZ(0)",
    WebkitTransform: "translateZ(0)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    perspective: 1000,
    WebkitPerspective: 1000,
    willChange: "transform",
  },
};

export default ExplorePage;