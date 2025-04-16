// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    const postBtn = document.getElementById('postBtn');
    
    postBtn.addEventListener('click', handlePostRequest);
});

/**
 * Handles the POST request when the button is clicked
 */
async function handlePostRequest() {
    const apiUrl = document.getElementById('apiUrl').value;
    const requestBodyText = document.getElementById('requestBody').value;
    const responseContainer = document.getElementById('responseContainer');
    
    try {
        // Parse the JSON input
        const requestBody = JSON.parse(requestBodyText);
        
        // Update UI to show loading
        responseContainer.innerHTML = '<p>Sending request...</p>';
        
        // Make the POST request
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        // Get the response data
        const data = await response.json();
        
        // Display the response
        responseContainer.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        
        // You can also check response.ok or response.status here
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
    } catch (error) {
        // Handle errors
        responseContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error('Error:', error);
    }
}