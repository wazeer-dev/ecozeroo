'use client';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent securely!");
  };

  return (
    <div style={{ paddingTop: '120px', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="section-header text-center">
          <p className="section-label">GET IN TOUCH</p>
          <h2 className="section-title">Contact ECOZERO</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface-color)', padding: '3rem', borderRadius: '20px', border: '1.5px solid rgba(4, 28, 11, 0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Name</label>
              <input required type="text" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }} placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
              <input required type="email" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none' }} placeholder="you@domain.com" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Message</label>
              <textarea required rows={5} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1.5px solid rgba(4, 28, 11, 0.1)', background: 'rgba(4, 28, 11, 0.04)', color: 'rgb(4, 28, 11)', outline: 'none', resize: 'vertical' }} placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem', borderRadius: '30px', fontWeight: 700 }}>Send Message</button>
          </div>
        </form>
      </div>
    </div>
  );
}
