// Test script for RAG service
pm.test("Response is successful", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has valid structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('response');
    pm.expect(response.response).to.be.a('string');
});

// Check for session cookie
pm.test("Session cookie is set", function () {
    const cookies = pm.response.cookies.all();
    const sessionCookie = cookies.find(cookie => cookie.name === 'sessionId');
    pm.expect(sessionCookie).to.exist;
    pm.expect(sessionCookie).to.have.property('value');
});

// Store session ID for subsequent requests
if (pm.response.cookies.has('sessionId')) {
    pm.environment.set('sessionId', pm.response.cookies.get('sessionId').value);
}

// Test chat history persistence
pm.test("Chat history is maintained", function () {
    const response = pm.response.json();
    // Check if response references previous context
    pm.expect(response.response).to.include('Based on our previous conversation');
});

// Test build generation
pm.test("Build generation is successful", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('build');
    pm.expect(response.build).to.have.property('buildType');
    pm.expect(response.build).to.have.property('recommendations');
});

// Test component filtering
pm.test("Component filtering works", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('components');
    pm.expect(response.components).to.be.an('array');
}); 