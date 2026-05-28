// Using the built-in fetch in Node 20+
(async () => {
  const res = await fetch('http://localhost:5000/api/bookings/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTgxOTdlMTcyZDhhMDdmYTAzM2QzZiIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzc5OTY0Mjg2LCJleHAiOjE3ODA1NjkwODZ9.wIANbRBfasuRh5fd0qpHV_2DwJ967shPGowaGaF-ctY',
    },
    body: JSON.stringify({
      tutorId: '6a18197e172d8a07fa033d3d',
      date: '2026-06-01',
      timeSlot: '10:00 AM',
      mode: 'online',
      duration: 1,
      subtotal: 500,
      platformFee: 50,
      total: 550,
    }),
  });
  console.log('status', res.status);
  console.log(await res.text());
})();
