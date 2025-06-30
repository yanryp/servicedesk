// src/components/TicketComments.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ClockIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';

interface CommentAuthor {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface TicketComment {
  id: number;
  content: string;
  commentType: string;
  isInternal: boolean;
  isSystemGenerated: boolean;
  createdAt: string;
  editedAt?: string;
  author: CommentAuthor;
  editor?: Pick<CommentAuthor, 'id' | 'username' | 'role'>;
  parentComment?: {
    id: number;
    content: string;
    author: Pick<CommentAuthor, 'id' | 'username' | 'role'>;
  };
  replies: TicketComment[];
  mentions: number[];
  attachments?: any[];
}

interface TicketCommentsProps {
  ticketId: number;
  onCommentAdded?: () => void;
}

const TicketComments: React.FC<TicketCommentsProps> = ({ ticketId, onCommentAdded }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showInternal, setShowInternal] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [canSeeInternal, setCanSeeInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load comments
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/tickets/${ticketId}/comments?includeInternal=${showInternal}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load comments');
      }

      const result = await response.json();
      setComments(result.data);
      setCanSeeInternal(result.meta.canSeeInternal);
    } catch (err: any) {
      console.error('Error loading comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [ticketId, showInternal, token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Add new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`http://localhost:3001/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim(),
          isInternal,
          parentCommentId: replyingTo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setNewComment('');
      setReplyingTo(null);
      setIsInternal(false);
      await loadComments();
      onCommentAdded?.();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      setEditingComment(null);
      setEditContent('');
      await loadComments();
    } catch (err: any) {
      console.error('Error editing comment:', err);
      setError(err.message || 'Failed to edit comment');
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      await loadComments();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Failed to delete comment');
    }
  };

  const startEditing = (comment: TicketComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const startReply = (commentId: number) => {
    setReplyingTo(commentId);
    textareaRef.current?.focus();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-50';
      case 'manager': return 'text-purple-600 bg-purple-50';
      case 'technician': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const canEditComment = (comment: TicketComment) => {
    return comment.author.id === user?.id || user?.role === 'admin';
  };

  const canDeleteComment = (comment: TicketComment) => {
    return comment.author.id === user?.id || user?.role === 'admin';
  };

  // Render comment item
  const renderComment = (comment: TicketComment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-8 mt-4' : 'mt-6'} ${
        comment.isInternal ? 'bg-amber-50 border-amber-200' : 'bg-white'
      } border rounded-lg p-4 shadow-sm`}
    >
      {/* Comment header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.author.username}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(comment.author.role)}`}>
                {comment.author.role}
              </span>
              {comment.isInternal && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Internal
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <ClockIcon className="w-3 h-3" />
              <span>{formatDate(comment.createdAt)}</span>
              {comment.editedAt && (
                <span className="text-gray-400">• edited {formatDate(comment.editedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Comment actions */}
        <div className="flex items-center space-x-1">
          {!isReply && (
            <button
              onClick={() => startReply(comment.id)}
              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
              title="Reply"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
            </button>
          )}
          
          {canEditComment(comment) && (
            <button
              onClick={() => startEditing(comment)}
              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          
          {canDeleteComment(comment) && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Parent comment reference (for replies) */}
      {comment.parentComment && (
        <div className="mb-3 p-2 bg-gray-50 rounded border-l-4 border-gray-300">
          <div className="text-sm text-gray-600">
            Replying to <span className="font-medium">{comment.parentComment.author.username}</span>:
          </div>
          <div className="text-sm text-gray-500 truncate">
            {comment.parentComment.content.substring(0, 100)}
            {comment.parentComment.content.length > 100 && '...'}
          </div>
        </div>
      )}

      {/* Comment content */}
      {editingComment === comment.id ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditComment(comment.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingComment(null);
                setEditContent('');
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-slate-200/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-800">
            Comments ({comments.length})
          </h2>
        </div>

        {canSeeInternal && (
          <button
            onClick={() => setShowInternal(!showInternal)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
              showInternal
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showInternal ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
            <span>{showInternal ? 'Hide Internal' : 'Show Internal'}</span>
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleAddComment} className="mb-6">
        {replyingTo && (
          <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Replying to comment</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-blue-400 hover:text-blue-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {canSeeInternal && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Internal note</span>
                </label>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-2">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments
            .filter(comment => !comment.parentComment) // Only show top-level comments
            .map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default TicketComments;