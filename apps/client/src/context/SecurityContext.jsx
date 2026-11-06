import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { soundEffects } from '../modules/audio/soundEffects.js';

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
  const [telemetry, setTelemetry] = useState(null);
  const [wsStatus, setWsStatus] = useState('CONNECTING'); // CONNECTING, CONNECTED, DISCONNECTED
  const [muted, setMuted] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeSimulations, setActiveSimulations] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [isScanningSubnet, setIsScanningSubnet] = useState(false);

  const wsRef = useRef(null);
  const lastThreatLevelRef = useRef(5);

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In dev mode with Vite proxy or production
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    setWsStatus('CONNECTING');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('CONNECTED');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'TELEMETRY_UPDATE') {
          setTelemetry(data);

          // Trigger audio alarms if threat escalated
          const currentDefcon = data.threat?.defcon ?? 5;
          if (currentDefcon < lastThreatLevelRef.current) {
            if (currentDefcon === 1) {
              soundEffects.playCriticalSiren();
            } else if (currentDefcon <= 3) {
              soundEffects.playWarningChime();
            }
          }
          lastThreatLevelRef.current = currentDefcon;
        }
      } catch (err) {
        console.error('Failed to parse WS payload', err);
      }
    };

    ws.onclose = () => {
      setWsStatus('DISCONNECTED');
      setTimeout(connectWebSocket, 2000); // Auto reconnect
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    fetchWhitelist();
    fetchPolicies();
    fetchSimulatorPresets();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  const fetchWhitelist = async () => {
    try {
      const res = await fetch('/api/whitelist');
      const data = await res.json();
      if (data.success) {
        setWhitelist(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/policies');
      const data = await res.json();
      if (data.success) {
        setPolicies(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSimulatorPresets = async () => {
    try {
      const res = await fetch('/api/simulator/presets');
      const data = await res.json();
      if (data.success) {
        setActiveSimulations(data.active || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const trustDevice = async (vid, pid, alias, deviceClass) => {
    try {
      const res = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid, pid, product_name: alias, device_class: deviceClass, trust_level: 'trusted' })
      });
      const data = await res.json();
      if (data.success) {
        fetchWhitelist();
        soundEffects.playRadarPing();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteWhitelist = async (id) => {
    try {
      await fetch(`/api/whitelist/${id}`, { method: 'DELETE' });
      fetchWhitelist();
    } catch (e) {
      console.error(e);
    }
  };

  const triggerScan = async () => {
    setIsScanningSubnet(true);
    soundEffects.playRadarPing();
    try {
      await fetch('/api/network/scan', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanningSubnet(false);
    }
  };

  const resolveIncident = async (id) => {
    try {
      await fetch(`/api/incidents/${id}/resolve`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const clearIncidents = async () => {
    try {
      await fetch('/api/incidents/clear', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSimulation = async (preset) => {
    try {
      const res = await fetch('/api/simulator/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSimulations(data.active || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const ejectSimulation = async (preset) => {
    try {
      const res = await fetch('/api/simulator/eject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSimulations(data.active || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetSimulations = async () => {
    try {
      const res = await fetch('/api/simulator/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActiveSimulations([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePolicy = async (policyKey, enabled) => {
    try {
      await fetch(`/api/policies/${policyKey}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      fetchPolicies();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        telemetry,
        wsStatus,
        muted,
        toggleMute,
        isSimulatorOpen,
        setIsSimulatorOpen,
        activeSimulations,
        whitelist,
        policies,
        isScanningSubnet,
        trustDevice,
        deleteWhitelist,
        triggerScan,
        resolveIncident,
        clearIncidents,
        triggerSimulation,
        ejectSimulation,
        resetSimulations,
        togglePolicy,
        refreshWhitelist: fetchWhitelist
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
