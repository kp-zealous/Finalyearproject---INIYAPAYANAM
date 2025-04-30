import { getFirestore, doc, setDoc } from 'firebase/firestore';  // Firebase Firestore SDK
import { getAuth } from 'firebase/auth';
import app from '../config/firebase'; // your Firebase initialization

export async function autoPlanTripUsingGemini(tripDetails, tripId) {
    // Ensure tripDetails contains all required properties
    if (!tripDetails.destination || !tripDetails.budget || !tripDetails.transportModes || !tripDetails.days || !tripDetails.people) {
        throw new Error("Missing required trip details.");
    }

    const prompt = `Plan a trip to ${tripDetails.destination} with the following details:
      - Number of Days: ${tripDetails.days}
      - Number of People: ${tripDetails.people}
      - Budget: ₹${tripDetails.budget}
      - Preferred Transport Modes: ${tripDetails.transportModes.join(', ')}
      
      Requirements:
      - Famous and must-visit places, avoid peak hours
      - Proper breaks: Breakfast, Lunch, Tea Break, Dinner, Night Stay
      - Approximate Distance between places (in KM)
      - Comfortable and relaxed pacing
      - Cover based on the given number of days
      - Respect budget constraints
      -importantly other than the json format dont give any extra explanation just give atleaset the max amout of days data
      
      Strictly respond in clean JSON format:
      [ 
        { 
          "day": 1, 
          "date": "2025-05-06", 
          "plan": [
            { "time": "9:00 AM", "activity": "Start at Baga Beach", "distance": "0 km" },
            { "time": "11:00 AM", "activity": "Visit Chapora Fort", "distance": "8 km" },
            ...
          ] 
        },
        ...
      ]
    `;

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=AIzaSyDNjEOlO7jE-huHBqROYR1PBiimO_kOFuw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            })
        });


        // Step 1: Log the raw response text to check its structure
        const responseText = await response.text();  // Get the raw response text
        console.log('API Response Text:', responseText);  // Log raw response to inspect it

        // Step 2: Check if the response is JSON and clean the content
        let data;
        try {
            // Clean up the raw response content by removing the code block markers (```json and ``` backticks)
            const cleanedContent = responseText.replace(/```json|```/g, '').trim();
            
            // Parse the cleaned content into JSON
            data = JSON.parse(cleanedContent);  
            console.log('Parsed Response:', data);  // Log the parsed response if successful
        } catch (error) {
            console.error('Error cleaning or parsing the JSON response:', error);
            throw new Error('Error parsing the trip plan response. The data might not be in valid JSON format.');
        }

        // Step 3: Extract the content from the parsed response
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) throw new Error('No valid trip plan generated.');

        // Step 4: Clean and parse the content again (if needed)
        console.log('Raw Content:', content);  // Log the raw content to inspect it
        const cleanContent = content.replace(/```json|```/g, '').trim();

        // Step 5: Parse the cleaned content
        try {
            const parsedPlan = JSON.parse(cleanContent);
            console.log("parsed content final",parsedPlan);
            const auth = getAuth(app);
            const userId = auth.currentUser?.uid;  // Use optional chaining to avoid errors if user is null
            if (!userId) throw new Error('User not authenticated.');

            const db = getFirestore(app);
            await setDoc(doc(db, 'trip_plans', `${userId}-${tripId}`), {
                plan: parsedPlan,        // The generated trip plan
                tripDetails: tripDetails, // Store trip details as well
                userId: userId,
                tripId: tripId,
                createdAt: new Date().toISOString(),
            });

            console.log('Trip plan saved to Firestore successfully!');
            return parsedPlan;
        } catch (error) {
            console.error('Error parsing or saving the trip plan:', error);
            throw new Error('Error generating or saving the trip plan: ' + error.message);
        }

    } catch (error) {
        console.error('Error fetching or processing the API response:', error);
        throw new Error('Error generating trip plan: ' + error.message);
    }
}
