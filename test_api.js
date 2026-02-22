async function testApi() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/advocates?role=legal_provider&verified=true');
        const data = await response.json();
        console.log('Success:', data.success);
        console.log('Count:', data.advocates ? data.advocates.length : 'N/A');
        if (data.advocates && data.advocates.length > 0) {
            console.log('Sample Name:', data.advocates[0].name);
            console.log('Sample Unique ID:', data.advocates[0].unique_id);
        } else {
            console.log('Full response:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testApi();
