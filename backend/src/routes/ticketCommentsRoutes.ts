// src/routes/ticketCommentsRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';

// Utility to handle async route errors
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>) => 
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const router = Router();
const prisma = new PrismaClient();

// Get all comments for a ticket
router.get('/tickets/:ticketId/comments', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  const { includeInternal = 'false' } = req.query;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // Check if user has access to the ticket
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(ticketId) },
    include: {
      createdBy: true,
      assignedTo: true
    }
  });

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  // Check permissions
  const canViewTicket = 
    ticket.createdByUserId === userId ||
    ticket.assignedToUserId === userId ||
    userRole === 'admin' ||
    userRole === 'technician' ||
    userRole === 'manager';

  if (!canViewTicket) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Determine if user can see internal comments
  const canSeeInternal = userRole === 'admin' || userRole === 'technician' || userRole === 'manager';
  const showInternal = includeInternal === 'true' && canSeeInternal;

  const comments = await prisma.ticketComment.findMany({
    where: {
      ticketId: parseInt(ticketId),
      isDeleted: false,
      ...(showInternal ? {} : { isInternal: false })
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        }
      },
      editor: {
        select: {
          id: true,
          username: true,
          role: true
        }
      },
      parentComment: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      },
      replies: {
        where: { isDeleted: false },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json({
    success: true,
    data: comments,
    meta: {
      total: comments.length,
      canAddComments: canViewTicket,
      canSeeInternal: canSeeInternal
    }
  });
}));

// Add a new comment to a ticket
router.post('/tickets/:ticketId/comments', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { ticketId } = req.params;
  const { content, commentType = 'comment', isInternal = false, parentCommentId, mentions = [] } = req.body;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: 'Comment content is required' });
    return;
  }

  // Check if user has access to the ticket
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(ticketId) },
    include: {
      createdBy: true,
      assignedTo: true
    }
  });

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  // Check permissions
  const canComment = 
    ticket.createdByUserId === userId ||
    ticket.assignedToUserId === userId ||
    userRole === 'admin' ||
    userRole === 'technician' ||
    userRole === 'manager';

  if (!canComment) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Only technicians, managers, and admins can make internal comments
  const finalIsInternal = isInternal && (userRole === 'admin' || userRole === 'technician' || userRole === 'manager');

  // Validate parent comment if provided
  if (parentCommentId) {
    const parentComment = await prisma.ticketComment.findFirst({
      where: {
        id: parseInt(parentCommentId),
        ticketId: parseInt(ticketId),
        isDeleted: false
      }
    });

    if (!parentComment) {
      res.status(400).json({ error: 'Parent comment not found' });
      return;
    }
  }

  // Create the comment
  const comment = await prisma.ticketComment.create({
    data: {
      ticketId: parseInt(ticketId),
      authorId: userId,
      content: content.trim(),
      commentType,
      isInternal: finalIsInternal,
      parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
      mentions: mentions.filter((id: number) => Number.isInteger(id))
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        }
      },
      parentComment: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      }
    }
  });

  // Create notifications for mentions
  if (mentions.length > 0) {
    const mentionNotifications = mentions
      .filter((mentionedUserId: number) => mentionedUserId !== userId)
      .map((mentionedUserId: number) => ({
        commentId: comment.id,
        recipientId: mentionedUserId,
        notificationType: 'mention' as const
      }));

    if (mentionNotifications.length > 0) {
      await prisma.commentNotification.createMany({
        data: mentionNotifications,
        skipDuplicates: true
      });
    }
  }

  // Create notification for parent comment author (if replying)
  if (parentCommentId) {
    const parentComment = await prisma.ticketComment.findUnique({
      where: { id: parseInt(parentCommentId) }
    });

    if (parentComment && parentComment.authorId !== userId) {
      await prisma.commentNotification.create({
        data: {
          commentId: comment.id,
          recipientId: parentComment.authorId,
          notificationType: 'reply'
        }
      });
    }
  }

  // Create notification for ticket participants (if not mentioned already)
  const ticketParticipants = [ticket.createdByUserId, ticket.assignedToUserId].filter(
    (id): id is number => id !== null && id !== userId && !mentions.includes(id)
  );

  if (ticketParticipants.length > 0) {
    const participantNotifications = ticketParticipants.map(participantId => ({
      commentId: comment.id,
      recipientId: participantId,
      notificationType: 'new_comment' as const
    }));

    await prisma.commentNotification.createMany({
      data: participantNotifications,
      skipDuplicates: true
    });
  }

  // Update ticket's updatedAt timestamp
  await prisma.ticket.update({
    where: { id: parseInt(ticketId) },
    data: { updatedAt: new Date() }
  });

  res.status(201).json({
    success: true,
    data: comment,
    message: 'Comment added successfully'
  });
}));

// Update a comment
router.put('/comments/:commentId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: 'Comment content is required' });
    return;
  }

  const comment = await prisma.ticketComment.findUnique({
    where: { id: parseInt(commentId) },
    include: { author: true }
  });

  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  if (comment.isDeleted) {
    res.status(410).json({ error: 'Comment has been deleted' });
    return;
  }

  // Check permissions (only author or admin can edit)
  const canEdit = comment.authorId === userId || userRole === 'admin';

  if (!canEdit) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Update the comment
  const updatedComment = await prisma.ticketComment.update({
    where: { id: parseInt(commentId) },
    data: {
      content: content.trim(),
      editedAt: new Date(),
      editedBy: userId
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        }
      },
      editor: {
        select: {
          id: true,
          username: true,
          role: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: updatedComment,
    message: 'Comment updated successfully'
  });
}));

// Delete a comment (soft delete)
router.delete('/comments/:commentId', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const comment = await prisma.ticketComment.findUnique({
    where: { id: parseInt(commentId) }
  });

  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  if (comment.isDeleted) {
    res.status(410).json({ error: 'Comment already deleted' });
    return;
  }

  // Check permissions (only author or admin can delete)
  const canDelete = comment.authorId === userId || userRole === 'admin';

  if (!canDelete) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // Soft delete the comment
  await prisma.ticketComment.update({
    where: { id: parseInt(commentId) },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    }
  });

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
}));

// Get unread comment notifications for user
router.get('/comments/notifications', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const notifications = await prisma.commentNotification.findMany({
    where: {
      recipientId: userId,
      isRead: false
    },
    include: {
      comment: {
        include: {
          ticket: {
            select: {
              id: true,
              title: true
            }
          },
          author: {
            select: {
              id: true,
              username: true,
              role: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: notifications,
    meta: {
      total: notifications.length
    }
  });
}));

// Mark comment notifications as read
router.post('/comments/notifications/mark-read', protect, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { notificationIds } = req.body;
  const userId = req.user!.id;

  if (!Array.isArray(notificationIds)) {
    res.status(400).json({ error: 'notificationIds must be an array' });
    return;
  }

  await prisma.commentNotification.updateMany({
    where: {
      id: { in: notificationIds.map(id => parseInt(id)) },
      recipientId: userId
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });

  res.json({
    success: true,
    message: 'Notifications marked as read'
  });
}));

export default router;