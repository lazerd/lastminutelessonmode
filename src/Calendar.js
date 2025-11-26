import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { sendSlotNotification } from './emailService';

function Calendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [slots, setSlots] = useState([]);
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    loadCoachAndSlots();
  }, [currentWeekStart]);

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff - d.getDate());
    return monday;
  }

  async function loadCoachAndSlots() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: coachData } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', user.id)
      .single();
    setCoach(coachData);

    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data: slotsData } = await supabase
      .from('slots')
      .select('*')
      .eq('coach_id', user.id)
      .gte('start_time', weekStart.toISOString())
      .lt('start_time', weekEnd.toISOString());

    setSlots(slotsData || []);
  }

  function previousWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  function getDateForDay(dayIndex) {
    const result = new Date(currentWeekStart);
    result.setDate(result.getDate() + dayIndex);
    return result;
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function makeSlotKey(date, hour) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(hour).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:00:00`;
  }

  function getSlotForTime(dayIndex, hour) {
    const dayDate = getDateForDay(dayIndex);
    const slotKey = makeSlotKey(dayDate, hour);
    
    return slots.find(slot => {
      const slotDate = new Date(slot.start_time);
      const slotKey2 = makeSlotKey(slotDate, slotDate.getHours());
      return slotKey === slotKey2;
    });
  }

  async function createSlot(dayIndex, hour) {
    if (!coach) return;

    const dayDate = getDateForDay(dayIndex);
    const year = dayDate.getFullYear();
    const month = dayDate.getMonth();
    const day = dayDate.getDate();
    
    const startTime = new Date(year, month, day, hour, 0, 0);
    const endTime = new Date(year, month, day, hour + 1, 0, 0);

    const timezoneOffset = startTime.getTimezoneOffset() * 60000;
    const startTimeUTC = new Date(startTime.getTime() - timezoneOffset);
    const endTimeUTC = new Date(endTime.getTime() - timezoneOffset);

    const { data: newSlot, error } = await supabase
      .from('slots')
      .insert([{
        coach_id: coach.id,
        start_time: startTimeUTC.toISOString(),
        end_time: endTimeUTC.toISOString(),
        status: 'AVAILABLE'
      }])
      .select()
      .single();

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    // Get approved clients
    const { data: clients } = await supabase
      .from('clients')
      .select('email')
      .eq('coach_id', coach.id)
      .eq('status', 'APPROVED');

    // Send emails if there are approved clients
    if (clients && clients.length > 0) {
      const clientEmails = clients.map(c => c.email);
      const bookingLink = `${window.location.origin}/book/${newSlot.id}`;
      
      const emailResult = await sendSlotNotification(
        coach.name,
        {
          date: startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
          time: `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
          bookingLink
        },
        clientEmails
      );

      if (emailResult.success) {
        alert(`✅ Slot created! ${emailResult.sent} email(s) sent to clients.`);
      } else {
        alert(`✅ Slot created! But email failed: ${emailResult.error}`);
      }
    } else {
      alert('✅ Slot created! (No approved clients to notify)');
    }

    await loadCoachAndSlots();
  }

  async function deleteSlot(slotId) {
    if (!window.confirm('Delete this time slot?')) return;

    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      await loadCoachAndSlots();
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={previousWeek} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>
          ← Previous Week
        </button>
        <h2>Week of {formatDate(currentWeekStart)}</h2>
        <button onClick={nextWeek} style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>
          Next Week →
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '10px', background: '#f5f5f5', minWidth: '80px' }}>Time</th>
              {days.map((day, i) => (
                <th key={i} style={{ border: '1px solid #ddd', padding: '10px', background: '#f5f5f5' }}>
                  {day}<br/>
                  <span style={{ fontSize: '12px', fontWeight: 'normal' }}>{formatDate(getDateForDay(i))}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                  {hour}:00
                </td>
                {days.map((_, dayIndex) => {
                  const slot = getSlotForTime(dayIndex, hour);
                  return (
                    <td 
                      key={dayIndex} 
                      style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px',
                        background: slot ? (slot.status === 'AVAILABLE' ? '#d4edda' : '#f8d7da') : 'white',
                        textAlign: 'center',
                        verticalAlign: 'middle'
                      }}
                    >
                      {slot ? (
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '14px',
                            color: slot.status === 'AVAILABLE' ? '#155724' : '#721c24',
                            marginBottom: '5px'
                          }}>
                            {slot.status === 'AVAILABLE' ? '✓ OPEN' : '✗ BOOKED'}
                          </div>
                          {slot.status === 'AVAILABLE' && (
                            <>
                              <a 
                                href={`/book/${slot.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  fontSize: '11px', 
                                  color: '#007bff',
                                  textDecoration: 'none',
                                  display: 'block',
                                  marginBottom: '5px'
                                }}
                              >
                                🔗 Share Link
                              </a>
                              <button
                                onClick={() => deleteSlot(slot.id)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✕ Delete
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => createSlot(dayIndex, hour)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          + Open Slot
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Calendar;