import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function FindCoach() {
    const [coaches, setCoaches] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadCoaches();
    }, []);

    async function loadCoaches() {
        const { data } = await supabase
            .from('coaches')
            .select('*')
            .order('name');
        setCoaches(data || []);
    }

    async function requestLessons(e) {
        e.preventDefault();
        setMessage('Sending request...');

        const { error } = await supabase
            .from('clients')
            .insert([{
                coach_id: selectedCoach.id,
                name,
                email,
                status: 'PENDING'
            }]);

        if (error) {
            if (error.code === '23505') {
                setMessage('❌ You already have a request with this coach!');
            } else {
                setMessage('❌ Error: ' + error.message);
            }
        } else {
            setMessage('✅ Request sent! The coach will review and approve you.');
            setName('');
            setEmail('');
            setTimeout(() => setSelectedCoach(null), 2000);
        }
    }

    return (
        <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🏸 Find a Coach</h1>
            <p>Browse available coaches and request lessons!</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                {coaches.map(coach => (
                    <div key={coach.id} style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '20px', background: '#f9f9f9' }}>
                        <h2 style={{ margin: '0 0 10px 0' }}>{coach.name}</h2>
                        <p style={{ margin: '5px 0', color: '#666' }}>🏆 Sport: {coach.sport}</p>
                        {coach.bio && <p style={{ margin: '10px 0', fontSize: '14px' }}>{coach.bio}</p>}
                        <button 
                            onClick={() => setSelectedCoach(coach)}
                            style={{ 
                                marginTop: '15px',
                                padding: '10px 20px', 
                                background: '#4CAF50', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                width: '100%'
                            }}
                        >
                            Request Lessons
                        </button>
                    </div>
                ))}
            </div>

            {coaches.length === 0 && <p>No coaches available yet.</p>}

            {selectedCoach && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ 
                        background: 'white', 
                        padding: '30px', 
                        borderRadius: '10px', 
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h2>Request Lessons from {selectedCoach.name}</h2>
                        <form onSubmit={requestLessons}>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Your Name:</label><br/>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px', fontSize: '16px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Your Email:</label><br/>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px', fontSize: '16px' }}
                                />
                            </div>
                            <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}>
                                Send Request
                            </button>
                            <button type="button" onClick={() => setSelectedCoach(null)} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </form>
                        {message && <p style={{ marginTop: '15px' }}>{message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FindCoach;