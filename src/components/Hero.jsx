import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Hero() {
  return (
    <section className="hero">

      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Skip the Queue.
        <br />
        Save Your Time.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Join shop queues digitally and avoid waiting in long lines.
      </motion.p>

      <div className="buttons">
        <Link to="/customer">
          <button>Join Queue</button>
        </Link>

        <Link to="/owner">
          <button className="secondary">
            Owner Dashboard
          </button>
        </Link>
      </div>

    </section>
  );
}

export default Hero;