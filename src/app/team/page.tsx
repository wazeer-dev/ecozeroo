'use client';

export default function TeamPage() {
  const team = [
    { name: 'Sarah Vanguard', role: 'Chief Eco Officer', img: '1573496359142-b8d87734a5a2' },
    { name: 'David Lin', role: 'Head of Product', img: '1506794778202-cad84cf45f1d' },
    { name: 'Elena Rodriguez', role: 'Sustainability Lead', img: '1580489944761-15a19d654956' },
  ];

  return (
    <div style={{ paddingTop: '120px', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container">
        <div className="section-header text-center">
          <p className="section-label">THE ECOZERO TEAM</p>
          <h2 className="section-title">Meet Our Experts</h2>
        </div>
        
        <div className="testimonial-grid">
          {team.map((member, idx) => (
            <div className="testimonial-card" key={idx} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <img 
                src={`https://images.unsplash.com/photo-${member.img}?q=80&w=300&auto=format&fit=crop`} 
                alt={member.name} 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', margin: '0 auto 1.5rem' }}
              />
              <h3>{member.name}</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

