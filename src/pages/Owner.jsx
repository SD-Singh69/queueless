import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiUsers, FiClock, FiCheck, FiShare2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
export default function Owner() {
  const { user } = useAuth(),
    { shops, entries, addShop, advance, updateShop } = useQueue(),
    [form, setForm] = useState({
      name: "",
      category: "",
      address: "",
      service: 5,
    }),
    [adding, setAdding] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState("");
  const mine = shops.filter((s) => s.ownerId === user.id);
  const current = mine.find((shop) => shop.id === selectedShopId) || mine[0];
  const line = useMemo(
    () =>
      entries
        .filter(
          (e) =>
            e.shopId === current?.id &&
            ["waiting", "serving"].includes(e.status),
        )
        .sort((a, b) => a.token - b.token),
    [entries, current],
  );
  const completed = entries.filter(
    (e) => e.shopId === current?.id && e.status === "completed",
  ).length;
  const history = entries.filter((e) => e.shopId === current?.id && ["completed", "cancelled"].includes(e.status));
  const completionRate = history.length ? Math.round((completed / history.length) * 100) : 100;
  const shareQueue = async () => {
    const text = `Join the queue for ${current.name} on QueueLess`;
    try {
      if (navigator.share) await navigator.share({ title: current.name, text, url: window.location.href });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); toast.success('Queue link copied'); }
      else window.prompt('Copy this queue link', window.location.href);
    } catch { toast('Share cancelled'); }
  };
  const create = (e) => {
    e.preventDefault();
    if (!form.name || !form.category)
      return toast.error("Add your shop name and category");
    const shop = addShop(form, user);
    setSelectedShopId(shop.id);
    setAdding(false);
    setForm({ name: "", category: "", address: "", service: 5 });
    toast.success("Your shop is ready to accept customers!");
  };
  return (
    <div className="dashboard">
      <div className="dash-head">
        <div>
          <div className="eyebrow">OWNER CONSOLE</div>
          <h1>Good morning, {user.name.split(" ")[0]}.</h1>
          <p>Everything is running smoothly.</p>
        </div>
        <button className="button" onClick={() => setAdding(true)}>
          <FiPlus /> Add shop
        </button>
      </div>
      {!current ? (
        <div className="empty">
          <h2>Open your first digital queue</h2>
          <p>
            Add your business to begin welcoming customers without the wait.
          </p>
          <button className="button" onClick={() => setAdding(true)}>
            <FiPlus /> Add your shop
          </button>
        </div>
      ) : (
        <>
          <section className="owner-title">
            <div>
              <button className={"queue-state " + (current.isOpen ? "open" : "closed")} onClick={() => updateShop(current.id, { isOpen: !current.isOpen })}><i /> {current.isOpen ? "Open now" : "Closed"}</button>
              <h2>{current.name}</h2>
              <p>
                {current.category} · {current.address}
              </p>
            </div>
            <button className="share-button" onClick={shareQueue}><FiShare2/> Share queue</button>
          </section>
          {mine.length > 1 && <label className="shop-switcher">Manage shop <select value={current.id} onChange={e => setSelectedShopId(e.target.value)}>{mine.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}</select></label>}
          <div className="metric-grid">
            <Metric icon={<FiUsers />} title="In queue" value={line.length} />
            <Metric
              icon={<FiClock />}
              title="Avg. wait"
              value={`${current.service} min`}
            />
            <Metric icon={<FiCheck />} title="Served today" value={completed} />
          </div>
          <section className="queue-panel">
            <div className="panel-head">
              <div>
                <h2>Live queue</h2>
                <p>
                  {line.length
                    ? `${line.length} customers waiting for you.`
                    : "No customers waiting right now."}
                </p>
              </div>
              <span className="live-pill">
                <i /> Live
              </span>
            </div>
            {line.length ? (
              <div className="line-list">
                {line.map((e, index) => (
                  <div className="line-item" key={e.id}>
                    <span className="line-token">
                      #{String(e.token).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>{e.customer}</strong>
                      <small>
                        Joined{" "}
                        {new Date(e.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                    <span className={"tag " + e.status}>
                      {e.status === "serving"
                        ? "Serving"
                        : index === 0
                          ? "Next up"
                          : "Waiting"}
                    </span>
                    {e.status === "waiting" ? (
                      <button onClick={() => advance(e.id, "serving")}>
                        Call next
                      </button>
                    ) : (
                      <button
                        className="complete"
                        onClick={() => advance(e.id, "completed")}
                      >
                        Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-line">
                Your queue is empty. Share your QueueLess page to start
                receiving customers.
              </div>
            )}
          </section>
          <section className="analytics-panel">
            <div><div className="eyebrow">QUEUE ANALYTICS</div><h2>Today at a glance</h2><p>Insights update as you manage your line.</p></div>
            <div className="analytics-stat"><strong>{completionRate}%</strong><span>completion rate</span><div className="progress"><i style={{ width: `${completionRate}%` }} /></div></div>
            <div className="analytics-stat"><strong>{completed}</strong><span>customers served</span><div className="progress"><i style={{ width: `${Math.min(completed * 10, 100)}%` }} /></div></div>
          </section>
        </>
      )}
      {adding && (
        <div className="modal-backdrop">
          <form className="modal shop-form" onSubmit={create}>
            <h2>Add a shop</h2>
            <label>
              Business name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Category
              <input
                placeholder="Salon, clinic, grocery…"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </label>
            <label>
              Address
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <label>
              Average service (minutes)
              <input
                type="number"
                min="1"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button className="button">Create queue</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
function Metric({ icon, title, value }) {
  return (
    <article className="metric">
      <span>{icon}</span>
      <small>{title}</small>
      <strong>{value}</strong>
    </article>
  );
}
