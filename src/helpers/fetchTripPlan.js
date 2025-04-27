import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import app from '../config/firebase'; // your firebase initialization

export async function fetchTripPlan(tripId) {
  const auth = getAuth(app);
  const userId = auth.currentUser.uid;
  const db = getDatabase(app);

  const tripPlanRef = ref(db, `tripPlans/${userId}/${tripId}`);
  const snapshot = await get(tripPlanRef);

  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    throw new Error('No trip plan found for this trip ID');
  }
}
