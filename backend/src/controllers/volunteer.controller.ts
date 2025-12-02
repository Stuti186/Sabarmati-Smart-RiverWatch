import { Request, Response } from 'express';
import { getFirestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const db = () => getFirestore();

// Get all volunteer events
export const getVolunteerEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type } = req.query;
    
    let query = db().collection('volunteerEvents');
    
    if (status) {
      query = query.where('status', '==', status) as any;
    }
    if (type) {
      query = query.where('type', '==', type) as any;
    }
    
    query = query.orderBy('startDate', 'asc') as any;
    
    const snapshot = await query.get();
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    logger.error('Get volunteer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer events',
    });
  }
};

// Get volunteer event by ID
export const getVolunteerEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const eventDoc = await db().collection('volunteerEvents').doc(id).get();
    
    if (!eventDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Volunteer event not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: eventDoc.id,
        ...eventDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Get volunteer event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer event',
    });
  }
};

// Create volunteer event (admin)
export const createVolunteerEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      location,
      address,
      startDate,
      endDate,
      maxParticipants,
      requirements = [],
      providedItems = [],
      images = [],
      rewardPoints = 50,
    } = req.body;
    
    if (!title || !description || !type || !location || !address || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }
    
    const eventData = {
      title,
      description,
      type,
      organizer: req.userId,
      location,
      address,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxParticipants: maxParticipants || null,
      registeredParticipants: [],
      relatedHotspot: null,
      status: 'upcoming',
      requirements,
      providedItems,
      images,
      results: null,
      rewardPoints,
      isPublic: true,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const eventRef = await db().collection('volunteerEvents').add(eventData);
    
    res.status(201).json({
      success: true,
      message: 'Volunteer event created successfully',
      data: {
        id: eventRef.id,
        ...eventData,
      },
    });
  } catch (error) {
    logger.error('Create volunteer event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating volunteer event',
    });
  }
};

// Register for event
export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }
    
    const eventDoc = await db().collection('volunteerEvents').doc(id).get();
    
    if (!eventDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Volunteer event not found',
      });
      return;
    }
    
    const eventData = eventDoc.data();
    const participants = eventData?.registeredParticipants || [];
    
    // Check if already registered
    if (participants.some((p: any) => p.userId === userId)) {
      res.status(400).json({
        success: false,
        message: 'Already registered for this event',
      });
      return;
    }
    
    // Check if event is full
    if (eventData?.maxParticipants && participants.length >= eventData.maxParticipants) {
      res.status(400).json({
        success: false,
        message: 'Event is full',
      });
      return;
    }
    
    participants.push({
      userId,
      registeredAt: new Date(),
      attended: false,
      wasteCollected: 0,
      hoursContributed: 0,
    });
    
    await eventDoc.ref.update({
      registeredParticipants: participants,
      updatedAt: new Date(),
    });
    
    res.status(200).json({
      success: true,
      message: 'Registered for event successfully',
    });
  } catch (error) {
    logger.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
    });
  }
};

// Mark attendance and award points (organizer/admin)
export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { participantUserId, attended, wasteCollected, hoursContributed } = req.body;
    
    const eventDoc = await db().collection('volunteerEvents').doc(id).get();
    
    if (!eventDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Volunteer event not found',
      });
      return;
    }
    
    const eventData = eventDoc.data();
    const participants = eventData?.registeredParticipants || [];
    
    const participantIndex = participants.findIndex((p: any) => p.userId === participantUserId);
    
    if (participantIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Participant not found',
      });
      return;
    }
    
    participants[participantIndex].attended = attended;
    if (wasteCollected !== undefined) participants[participantIndex].wasteCollected = wasteCollected;
    if (hoursContributed !== undefined) participants[participantIndex].hoursContributed = hoursContributed;
    
    await eventDoc.ref.update({
      registeredParticipants: participants,
      updatedAt: new Date(),
    });
    
    // Award reward points if attended
    if (attended && eventData?.rewardPoints) {
      const userDoc = await db().collection('users').doc(participantUserId).get();
      if (userDoc.exists) {
        const currentPoints = userDoc.data()?.rewardPoints || 0;
        await userDoc.ref.update({
          rewardPoints: currentPoints + eventData.rewardPoints,
        });
        
        // Create reward transaction
        await db().collection('rewardTransactions').add({
          userId: participantUserId,
          points: eventData.rewardPoints,
          reason: `Participated in volunteer event: ${eventData.title}`,
          awardedBy: req.userId,
          timestamp: new Date(),
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
    });
  } catch (error) {
    logger.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
    });
  }
};

// Update volunteer event (organizer/admin)
export const updateVolunteerEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    delete updateData.createdAt;
    delete updateData.organizer;
    delete updateData.registeredParticipants;
    
    const eventDoc = await db().collection('volunteerEvents').doc(id).get();
    
    if (!eventDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Volunteer event not found',
      });
      return;
    }
    
    updateData.updatedAt = new Date();
    
    await eventDoc.ref.update(updateData);
    
    const updatedDoc = await eventDoc.ref.get();
    
    res.status(200).json({
      success: true,
      message: 'Volunteer event updated successfully',
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    logger.error('Update volunteer event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating volunteer event',
    });
  }
};

// Delete volunteer event (admin)
export const deleteVolunteerEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const eventDoc = await db().collection('volunteerEvents').doc(id).get();
    
    if (!eventDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Volunteer event not found',
      });
      return;
    }
    
    await eventDoc.ref.delete();
    
    res.status(200).json({
      success: true,
      message: 'Volunteer event deleted successfully',
    });
  } catch (error) {
    logger.error('Delete volunteer event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting volunteer event',
    });
  }
};
