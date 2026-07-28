import { useEffect, useState } from "react";
import axios from "axios";
import "./Health.css";

function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
    try {
        const res = await axios.get("http://localhost:8080/api/health");
        setHealth(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
    fetchHealth();
    }, []);

  if (loading) return <h3>Loading...</h3>;

  return (
    <div className="grid">
        <div className="card">
            <h3>Health Score</h3>
            <h1>{health.healthScore}%</h1>
        </div>

        <div className="card">
            <h3>Total Nodes</h3>
            <h1>{health.totalNodes}</h1>
        </div>

        <div className="card">
            <h3>Healthy Nodes</h3>
            <h1>{health.healthyNodes}</h1>
        </div>

        <div className="card">
            <h3>Unhealthy Nodes</h3>
            <h1>{health.unhealthyNodes}</h1>
        </div>

        <div className="card">
            <h3>Total Pods</h3>
            <h1>{health.totalPods}</h1>
        </div>

        <div className="card">
            <h3>Running Pods</h3>
            <h1>{health.runningPods}</h1>
        </div>

        <div className="card">
            <h3>Pending Pods</h3>
            <h1>{health.pendingPods}</h1>
        </div>

        <div className="card">
            <h3>Failed Pods</h3>
            <h1>{health.failedPods}</h1>
        </div>
        <div className="card">
        <h3>Cluster Status</h3>

        <h2
            style={{
            color: health.healthScore >= 90 ? "green" : "red",
            }}
        >
            {health.healthScore >= 90 ? "Healthy" : "Unhealthy"}
        </h2>
        </div>
    </div>
  );
}

export default Health;