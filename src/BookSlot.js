import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabase';

function BookSlot() {
  const { slotId } = useParams();
  const [slot, setSlot] = useState(null);
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadSlotDetails();
  }, [slotId]);

  async function loadSlotDetails() {
    // Get slot details
    const { data: slotData, error: slotError } = await supabase
      .from('slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (slotError || !slotData) {
      setMessage('❌ Slot not found!');
      setLoading(false);
      return;
    }

    // Check if slot is still available
    if (slotData.status !== 'AVAILABLE') {
      setMessage('❌ Sorry, this slot has already been booked!');
      setLoading(false);
      return;
    }

    setSlot(slotData);

    // Get coach details
    const { data: coachData } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', slotData.coach_id)
      .single();

    setCoach(coachData);
    setLoading(false);
  }

  async function handleBooking(e) {
    e.preventDefault();
    setBooking(true);
    setMessage('Checking eligibility...');

    // Check if client is approved for this coach
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('coach_id', coach.id)
      .eq('email', clientEmail)
      .eq('status', 'APPROVED')
      .single();

    if (clientError || !clientData) {
      setMessage('❌ You are not an approved client of this coach. Please request lessons first!');
      setBooking(false);
      return;
    }

    // Verify name matches
    if (clientData.name.toLowerCase() !== clientName.toLowerCase()) {
      setMessage('❌ Name does not match our records!');
      setBooking(false);
      return;
    }

    setMessage('Booking your slot...');

    // Book the slot with atomic update
    const { data: updateData, error: updateError } = await supabase
      .from('slots')
      .update({
        status: 'BOOKED',
        booked_by_client_id: clientData.id,
        booked_at: new Date().toISOString()
      })
      .eq('id', slotId)
      .eq('status', 'AVAILABLE') // Only update if still available
      .select();

    if (updateError || !updateData || updateData.length === 0) {
      setMessage('❌ Sorry! Someone else just booked this slot. Please try another time.');
      setBooking(false);
      return;
    }

    setMessage('✅ SUCCESS! Your lesson is booked!');
    setSlot({ ...slot, status: 'BOOKED' });
    setBooking(false);
  }

  if (loading) {
    return <div style={{ padding: '50px', fontFamily: 'Arial' }}>Loading...</div>;
  }

  if (!slot || !coach) {
    return (
      <div style={{ padding: '50px', fontFamily: 'Arial', textAlign: 'center' }}>
        <h1>❌ Slot Not Found</h1>
        <p>{message}</p>
      </div>
    );
  }

  const startTime = new Date(slot.start_time);
  const endTime = new Date(slot.end_time);

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🏸 Book a Lesson</h1>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Lesson Details</h2>
        <p><strong>Coach:</strong> {coach.name}</p>
        <p><strong>Sport:</strong> {coach.sport}</p>
        <p><strong>Date:</strong> {startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p><strong>Time:</strong> {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
        <p><strong>Status:</strong> <span style={{ color: slot.status === 'AVAILABLE' ? 'green' : 'red', fontWeight: 'bold' }}>{slot.status}</span></p>
      </div>

      {slot.status === 'AVAILABLE' ? (
        <form onSubmit={handleBooking}>
          <h3>Book This Slot</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>You must be an approved client to book.</p>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Your Name:</label><br/>
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              disabled={booking}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label>Your Email:</label><br/>
            <input 
              type="email" 
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              disabled={booking}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={booking}
            style={{ 
              padding: '15px 30px', 
              fontSize: '18px', 
              cursor: booking ? 'not-allowed' : 'pointer',
              background: booking ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              width: '100%'
            }}
          >
            {booking ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', background: '#ffebee', borderRadius: '10px' }}>
          <h3>❌ This slot has been booked</h3>
          <p>Please check with the coach for other available times.</p>
        </div>
      )}

      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default BookSlot;