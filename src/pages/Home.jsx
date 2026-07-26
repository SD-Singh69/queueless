import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiBell, FiClock, FiShield } from "react-icons/fi";
import { useQueue } from "../context/QueueContext";
export default function Home() {
  const { shops } = useQueue();
  return (
    <>
      <section className="hero">
        <div className="eyebrow">THE SMART WAY TO WAIT</div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your time is
          <br />
          <em>worth more.</em>
        </motion.h1>
        <p>
          Join a queue from wherever you are. We’ll keep your place and let you
          know exactly when to arrive.
        </p>
        <div className="actions">
          <Link className="button" to="/register">
            Join a queue <FiArrowRight />
          </Link>
          <Link className="text-link" to="/register">
            I run a business
          </Link>
        </div>
        <div className="live-pill">
          <i /> Live queues updating now
        </div>
      </section>
      <section className="section">
        <div className="section-top">
          <div>
            <div className="eyebrow">NEARBY & OPEN</div>
            <h2>Skip the line, not the plan.</h2>
          </div>
          <Link className="text-link" to="/dashboard">
            View all queues <FiArrowRight />
          </Link>
        </div>
        <div className="shop-grid">
          {shops.map((s) => (
            <article className="shop-card" key={s.id}>
              <div className="shop-icon">{s.name[0]}</div>
              <div className="status">
                <i /> Open
              </div>
              <h3>{s.name}</h3>
              <p>
                {s.category} · {s.address}
              </p>
              <div className="shop-meta">
                <span>
                  <FiClock /> ~{s.wait} min
                </span>
                <span>{s.active} waiting</span>
              </div>
              <Link to="/register" className="card-action">
                View queue <FiArrowRight />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="benefits">
        <div>
          <FiClock />
          <h3>Time back</h3>
          <p>Wait on your terms, not in a crowded line.</p>
        </div>
        <div>
          <FiBell />
          <h3>Always in the know</h3>
          <p>Helpful alerts keep you a step ahead.</p>
        </div>
        <div>
          <FiShield />
          <h3>Simple & private</h3>
          <p>Your place is protected with secure sign-in.</p>
        </div>
      </section>
      <footer>© 2026 QueueLess · Designed for calmer days</footer>
    </>
  );
}
