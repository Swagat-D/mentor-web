import { connectToDatabase } from '@/lib/database/connection';

export async function setupReviewsCollection() {
  try {
    const { db } = await connectToDatabase();
    
    // Create reviews collection if it doesn't exist
    const collections = await db.listCollections({ name: 'reviews' }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection('reviews');
      console.log('Reviews collection created');
      
      // Create indexes for better performance
      await db.collection('reviews').createIndexes([
        { key: { mentorId: 1 } },
        { key: { studentId: 1 } },
        { key: { sessionId: 1 } },
        { key: { rating: 1 } },
        { key: { createdAt: -1 } },
        { key: { mentorId: 1, createdAt: -1 } },
        { key: { mentorId: 1, rating: 1 } }
      ]);
      console.log('Reviews collection indexes created');
    }

    // Sample review document structure for reference:
    const sampleReview = {
      _id: "ObjectId", // Auto-generated
      mentorId: "ObjectId", // Reference to mentor
      studentId: "ObjectId", // Reference to student  
      sessionId: "ObjectId", // Reference to session
      rating: 5, // 1-5 stars
      title: "Excellent teaching and clear explanations",
      content: "John is an amazing tutor! He explains complex calculus concepts...",
      tags: ["patient", "clear", "helpful"], // Optional tags
      helpfulVotes: 8, // Number of helpful votes
      reply: "Thank you so much, Sarah! It was a pleasure working with you...", // Mentor's reply
      replyDate: "2024-11-11T14:20:00Z", // When mentor replied
      createdAt: "2024-11-11T09:15:00Z",
      updatedAt: "2024-11-11T14:20:00Z"
    };
    
    console.log('Sample review structure:', sampleReview);
    
    return true;
  } catch (error) {
    console.error('Error setting up reviews collection:', error);
    return false;
  }
}

// Function to migrate existing session feedback to reviews collection
export async function migrateSessionFeedbackToReviews() {
  try {
    const { db } = await connectToDatabase();
    
    // Find sessions with feedback/reviews
    const sessionsWithFeedback = await db.collection('sessions').find({
      status: 'completed',
      'feedback.rating': { $exists: true }
    }).toArray();
    
    console.log(`Found ${sessionsWithFeedback.length} sessions with feedback to migrate`);
    
    for (const session of sessionsWithFeedback) {
      if (session.feedback && session.feedback.rating) {
        // Check if review already exists
        const existingReview = await db.collection('reviews').findOne({
          sessionId: session._id
        });
        
        if (!existingReview) {
          const review = {
            mentorId: session.mentorId,
            studentId: session.studentId,
            sessionId: session._id,
            rating: session.feedback.rating,
            title: session.feedback.title || 'Session Review',
            content: session.feedback.comment || session.feedback.content || '',
            tags: session.feedback.tags || [],
            helpfulVotes: session.feedback.helpfulVotes || 0,
            reply: session.feedback.mentorReply || null,
            replyDate: session.feedback.replyDate || null,
            createdAt: session.feedback.createdAt || session.updatedAt || session.createdAt,
            updatedAt: session.feedback.updatedAt || session.updatedAt || session.createdAt
          };
          
          await db.collection('reviews').insertOne(review);
        }
      }
    }
    
    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Error migrating feedback to reviews:', error);
    return false;
  }
}

// Usage example - run this once to set up the collection
// setupReviewsCollection().then(() => {
//   migrateSessionFeedbackToReviews();
// });