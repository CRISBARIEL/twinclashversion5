import { getFirestore } from "../lib/firebase";

export async function testFirestoreWrite() {
  try {
    const db = getFirestore();
    await db.collection("duels").doc("TEST123").set({
      ok: true,
      t: Date.now()
    });
    alert("FIRESTORE WRITE OK");
    console.log("FIRESTORE WRITE OK");
  } catch (e) {
    alert("FIRESTORE WRITE FAIL: " + String(e));
    console.error("FIRESTORE WRITE FAIL", e);
  }
}
