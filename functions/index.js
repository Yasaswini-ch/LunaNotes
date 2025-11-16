const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getGroqCompletion, getGroqChatCompletion } = require("./utils/groqClient");
const { generateMermaidMindmap } = require("./utils/mindmapGenerator");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();

// Helper to check authentication
const assertAuthenticated = (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }
};

/**
 * Processes raw text notes using Groq AI.
 */
exports.processNotes = functions.https.onCall(async (data, context) => {
  assertAuthenticated(context);
  const { text } = data;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a non-empty 'text' argument.",
    );
  }

  try {
    const processedData = await getGroqCompletion(text);
    return processedData;
  } catch (error) {
    console.error("Error processing notes with Groq:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to process notes.",
      error,
    );
  }
});

/**
 * Generates a mindmap structure in Mermaid syntax from processed notes.
 */
exports.generateMermaidMindmap = functions.https.onCall(async (data, context) => {
  assertAuthenticated(context);
  const { processedNotes } = data;

  if (!processedNotes || typeof processedNotes !== "object") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'processedNotes' object.",
    );
  }

  try {
    const mermaidSyntax = generateMermaidMindmap(processedNotes);
    return { mermaidSyntax };
  } catch (error) {
    console.error("Error generating mermaid mindmap:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate mindmap.",
      error,
    );
  }
});

/**
 * Saves processed notes and updates the user's study streak.
 */
exports.saveNotes = functions.https.onCall(async (data, context) => {
  assertAuthenticated(context);
  const uid = context.auth.uid;
  const { processedData } = data;

  if (!processedData || typeof processedData !== "object") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'processedData' object.",
    );
  }

  const noteId = uuidv4();
  const filePath = `users/${uid}/notes/${noteId}.json`;
  const file = storage.file(filePath);
  const userStatsRef = db.collection("users").doc(uid);

  try {
    // Run storage upload and firestore updates in a transaction for consistency
    await db.runTransaction(async (transaction) => {
      const userStatsDoc = await transaction.get(userStatsRef);
      const now = new Date();
      let currentStreak = 0;
      let lastSavedAt = null;

      if (userStatsDoc.exists) {
        const stats = userStatsDoc.data();
        currentStreak = stats.streak || 0;
        lastSavedAt = stats.lastSavedAt?.toDate(); // Firestore timestamp to JS Date
      }

      const isNewDay = !lastSavedAt ||
        now.toDateString() !== lastSavedAt.toDateString();

      if (isNewDay) {
         if (lastSavedAt) {
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            if (lastSavedAt.toDateString() === yesterday.toDateString()) {
                currentStreak++; // It's consecutive
            } else {
                currentStreak = 1; // Streak was broken
            }
         } else {
            currentStreak = 1; // First note ever
         }
      }
      // If it's the same day, streak doesn't change.

      // 1. Save metadata to Firestore
      const noteDocRef = userStatsRef.collection("lunanotes").doc(noteId);
      transaction.set(noteDocRef, {
        owner: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        summary: processedData.summary || "Untitled Note",
        storagePath: filePath,
        noteId: noteId,
      });

      // 2. Update user stats
      transaction.set(userStatsRef, {
        streak: currentStreak,
        lastSavedAt: now,
        totalNotes: admin.firestore.FieldValue.increment(1)
      }, { merge: true });
    });

    // 3. Upload JSON to Storage (outside transaction)
    await file.save(JSON.stringify(processedData, null, 2), {
      contentType: "application/json",
    });

    const finalStats = (await userStatsRef.get()).data();
    return {
      success: true,
      noteId: noteId,
      streak: finalStats.streak,
      totalNotes: finalStats.totalNotes,
    };
  } catch (error) {
    console.error("Error saving note and updating streak:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to save note.",
      error,
    );
  }
});


/**
 * Handles chat interactions based on the context of the processed notes.
 */
exports.chatWithNotes = functions.https.onCall(async (data, context) => {
    assertAuthenticated(context);
    const { processedNotes, history, question } = data;

    if (!processedNotes || !history || !question) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required arguments: processedNotes, history, or question.",
        );
    }
    
    try {
        const answer = await getGroqChatCompletion(processedNotes, history, question);
        return { answer };
    } catch (error) {
        console.error("Error in chat function:", error);
        throw new functions.https.HttpsError("internal", "Failed to get chat response.");
    }
});

/**
 * Retrieves a list of saved notes for the authenticated user.
 */
exports.getNotesHistory = functions.https.onCall(async (data, context) => {
  assertAuthenticated(context);
  const uid = context.auth.uid;

  try {
    const snapshot = await db.collection("users").doc(uid).collection("lunanotes")
      .orderBy("createdAt", "desc")
      .get();
    
    if (snapshot.empty) {
      return [];
    }

    const notes = snapshot.docs.map((doc) => {
        const noteData = doc.data();
        return {
            noteId: doc.id,
            summary: noteData.summary,
            createdAt: noteData.createdAt.toDate().toISOString(),
        };
    });
    return notes;

  } catch (error) {
    console.error("Error getting notes history:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to retrieve notes history.",
    );
  }
});

/**
 * Retrieves the full details of a single saved note from storage.
 */
exports.getNoteDetails = functions.https.onCall(async (data, context) => {
    assertAuthenticated(context);
    const uid = context.auth.uid;
    const { noteId } = data;

    if (!noteId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with a 'noteId'.",
        );
    }

    try {
        const noteDocRef = db.collection("users").doc(uid).collection("lunanotes").doc(noteId);
        const noteDoc = await noteDocRef.get();

        if (!noteDoc.exists) {
            throw new functions.https.HttpsError(
                "not-found",
                "Note not found or you do not have permission to access it.",
            );
        }
        
        const { storagePath } = noteDoc.data();
        if (!storagePath) {
             throw new functions.https.HttpsError(
                "internal",
                "Note record is corrupted; storage path is missing.",
            );
        }

        const file = storage.file(storagePath);
        const [contents] = await file.download();
        
        return JSON.parse(contents.toString());

    } catch (error) {
        console.error(`Error getting note details for noteId ${noteId}:`, error);
        if (error.code) { 
            throw error;
        }
        throw new functions.https.HttpsError(
            "internal",
            "Failed to retrieve note details.",
        );
    }
});

/**
 * Retrieves dashboard stats for the authenticated user.
 */
exports.getDashboardStats = functions.https.onCall(async (data, context) => {
    assertAuthenticated(context);
    const uid = context.auth.uid;

    try {
        const userStatsRef = db.collection("users").doc(uid);
        const notesRef = userStatsRef.collection("lunanotes");

        const userStatsDoc = await userStatsRef.get();
        const streak = userStatsDoc.exists ? userStatsDoc.data().streak || 0 : 0;
        const totalNotes = userStatsDoc.exists ? userStatsDoc.data().totalNotes || 0 : 0;

        // Get notes from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentNotesSnapshot = await notesRef
            .where("createdAt", ">=", sevenDaysAgo)
            .orderBy("createdAt", "desc")
            .get();
        
        const recentActivity = recentNotesSnapshot.docs.map(doc => ({
            noteId: doc.id,
            summary: doc.data().summary,
            createdAt: doc.data().createdAt.toDate().toISOString(),
        }));

        return {
            streak,
            totalNotes,
            recentActivity,
        };
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Failed to retrieve dashboard stats.",
        );
    }
});