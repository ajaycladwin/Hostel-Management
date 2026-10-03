const fetch = globalThis.fetch;

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    // 1. Register or Login to get token
    console.log('Testing Login/Register...');
    const randomEmail = `testuser_${Date.now()}@test.com`;
    let authRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: randomEmail, password: 'password123', role: 'admin' })
    });
    
    let authData = await authRes.json();
    if (!authRes.ok) {
        console.log('Register failed, trying login...');
        // try login if email exists (though we made it random)
    }
    
    const token = authData.token;
    const userId = authData._id; // assume auth returns _id or we can get it from users API

    if (!token) {
        throw new Error('Could not obtain token');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    // Check if we need to fetch user ID
    let finalUserId = userId;
    if (!finalUserId) {
        const userRes = await fetch(`${baseUrl}/auth/profile`, { headers });
        const userData = await userRes.json();
        finalUserId = userData._id;
    }

    // 2. Create resident
    console.log('Testing Create Resident...');
    const createRes = await fetch(`${baseUrl}/residents`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: finalUserId,
        registerNumber: `REG-${Date.now()}`,
        phone: '1234567890',
        department: 'CS',
        year: '3',
        status: 'Active'
      })
    });
    const createdData = await createRes.json();
    if (!createRes.ok) throw new Error(createdData.message || 'Create failed');
    console.log('PASS: Create resident');
    
    const residentId = createdData._id;

    // 1. Fetch residents
    console.log('Testing Fetch Residents...');
    const fetchRes = await fetch(`${baseUrl}/residents`, { headers });
    const fetchedData = await fetchRes.json();
    if (!fetchRes.ok || !Array.isArray(fetchedData)) throw new Error('Fetch failed');
    console.log('PASS: Fetch residents');

    // 3. Edit resident
    console.log('Testing Edit Resident...');
    const editRes = await fetch(`${baseUrl}/residents/${residentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        department: 'IT'
      })
    });
    const editedData = await editRes.json();
    if (!editRes.ok || editedData.department !== 'IT') throw new Error('Edit failed');
    console.log('PASS: Edit resident');

    // 4. Delete resident
    console.log('Testing Delete Resident...');
    const deleteRes = await fetch(`${baseUrl}/residents/${residentId}`, {
      method: 'DELETE',
      headers
    });
    if (!deleteRes.ok) throw new Error('Delete failed');
    console.log('PASS: Delete resident');

  } catch (err) {
    console.error('TEST FAILED:', err.message);
  }
}

runTests();
