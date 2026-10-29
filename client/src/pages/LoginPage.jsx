import React, { useState } from 'react';
import { Boxes, Lock, Mail, User, Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.auth.register({ name, email, password, role: 'admin' });
      } else {
        res = await api.auth.login({ email, password });
      }

      if (res.success && res.data?.token) {
        localStorage.setItem('stockwise_token', res.data.token);
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role = 'admin') => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.demoLogin(role);
      if (res.success && res.data?.token) {
        localStorage.setItem('stockwise_token', res.data.token);
        onLoginSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="brand-icon"
            style={{ width: '52px', height: '52px', margin: '0 auto 12px auto', borderRadius: '14px' }}
          >
            <Boxes size={30} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            StockWise
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Smart Inventory & Sales Prediction System
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#ef4444',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              marginBottom: '18px',
              border: '1px solid #fee2e2',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem', marginTop: '10px' }}
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In to Dashboard')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.84rem', cursor: 'pointer', fontWeight: '600' }}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        {/* Demo One-Click Access */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Shield size={14} /> One-Click Evaluator Demo Access
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', background: '#eff6ff', color: '#1d4ed8', borderColor: '#dbeafe' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('manager')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('staff')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
            >
              Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
