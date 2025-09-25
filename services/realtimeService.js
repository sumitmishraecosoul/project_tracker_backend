const WebSocket = require('ws');
const RealtimeSubscription = require('../models/RealtimeSubscription');
const Notification = require('../models/Notification');
const User = require('../models/User');

class RealtimeService {
  constructor() {
    this.connections = new Map(); // userId -> Set of WebSocket connections
    this.roomConnections = new Map(); // roomId -> Set of WebSocket connections
    this.connectionUsers = new Map(); // connectionId -> userId
    this.rooms = new Map(); // roomId -> Set of userIds
  }

  /**
   * Add WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} userId - User ID
   * @param {string} brandId - Brand ID
   */
  addConnection(ws, userId, brandId) {
    const connectionId = this.generateConnectionId();
    
    // Store connection
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId).add(ws);
    
    // Store connection metadata
    this.connectionUsers.set(connectionId, { userId, brandId, ws });
    
    // Set up connection event handlers
    ws.on('close', () => this.removeConnection(ws, userId));
    ws.on('error', (error) => this.handleConnectionError(ws, userId, error));
    ws.on('message', (data) => this.handleMessage(ws, userId, data));
    
    console.log(`WebSocket connection added for user ${userId} in brand ${brandId}`);
    
    return connectionId;
  }

  /**
   * Remove WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} userId - User ID
   */
  removeConnection(ws, userId) {
    if (this.connections.has(userId)) {
      this.connections.get(userId).delete(ws);
      if (this.connections.get(userId).size === 0) {
        this.connections.delete(userId);
      }
    }
    
    // Remove from connection users
    for (const [connectionId, userData] of this.connectionUsers.entries()) {
      if (userData.ws === ws) {
        this.connectionUsers.delete(connectionId);
        break;
      }
    }
    
    console.log(`WebSocket connection removed for user ${userId}`);
  }

  /**
   * Handle connection error
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} userId - User ID
   * @param {Error} error - Error object
   */
  handleConnectionError(ws, userId, error) {
    console.error(`WebSocket error for user ${userId}:`, error);
    this.removeConnection(ws, userId);
  }

  /**
   * Handle incoming message
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} userId - User ID
   * @param {Buffer} data - Message data
   */
  async handleMessage(ws, userId, data) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscribe(ws, userId, message);
          break;
        case 'unsubscribe':
          await this.handleUnsubscribe(ws, userId, message);
          break;
        case 'ping':
          this.sendMessage(ws, { type: 'pong', timestamp: Date.now() });
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendMessage(ws, { type: 'error', message: 'Invalid message format' });
    }
  }

  /**
   * Handle subscription request
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} userId - User ID
   * @param {Object} message - Message object
   */
  async handleSubscribe(ws, userId, message) {
    try {
      const { taskId, projectId, brandId, subscriptionType } = message;
      
      if (!taskId || !projectId || !brandId) {
        this.sendMessage(ws, { type: 'error', message: 'Missing required fields' });
        return;
      }
      
      // Create or update subscription
      const subscription = await RealtimeSubscription.findOneAndUpdate(
        { brand_id: brandId, userId: userId, taskId: taskId },
        {
          brand_id: brandId,
          userId: userId,
          taskId: taskId,
          projectId: projectId,
          subscriptionType: subscriptionType || 'all',
          status: 'active',
          lastSeenAt: new Date()
        },
        { upsert: true, new: true }
      );
      
      // Add to room
      const roomId = `${brandId}-${taskId}`;
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }
      this.rooms.get(roomId).add(userId);
      
      // Add connection to room
      if (!this.roomConnections.has(roomId)) {
        this.roomConnections.set(roomId, new Set());
      }
      this.roomConnections.get(roomId).add(ws);
      
      this.sendMessage(ws, { 
        type: 'subscribed', 
        taskId, 
        projectId, 
        brandId, 
        subscriptionType: subscription.subscriptionType 
      });
      
      console.log(`User ${userId} subscribed to task ${taskId} in brand ${brandId}`);
    } catch (error) {
      console.error('Error handling subscription:', error);
      this.sendMessage(ws, { type: 'error', message: 'Failed to subscribe' });
    }
  }

  /**
   * Handle unsubscription request
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} userId - User ID
   * @param {Object} message - Message object
   */
  async handleUnsubscribe(ws, userId, message) {
    try {
      const { taskId, brandId } = message;
      
      if (!taskId || !brandId) {
        this.sendMessage(ws, { type: 'error', message: 'Missing required fields' });
        return;
      }
      
      // Update subscription status
      await RealtimeSubscription.findOneAndUpdate(
        { brand_id: brandId, userId: userId, taskId: taskId },
        { status: 'cancelled' }
      );
      
      // Remove from room
      const roomId = `${brandId}-${taskId}`;
      if (this.rooms.has(roomId)) {
        this.rooms.get(roomId).delete(userId);
        if (this.rooms.get(roomId).size === 0) {
          this.rooms.delete(roomId);
        }
      }
      
      // Remove connection from room
      if (this.roomConnections.has(roomId)) {
        this.roomConnections.get(roomId).delete(ws);
        if (this.roomConnections.get(roomId).size === 0) {
          this.roomConnections.delete(roomId);
        }
      }
      
      this.sendMessage(ws, { type: 'unsubscribed', taskId, brandId });
      
      console.log(`User ${userId} unsubscribed from task ${taskId} in brand ${brandId}`);
    } catch (error) {
      console.error('Error handling unsubscription:', error);
      this.sendMessage(ws, { type: 'error', message: 'Failed to unsubscribe' });
    }
  }

  /**
   * Broadcast message to room
   * @param {string} brandId - Brand ID
   * @param {string} taskId - Task ID
   * @param {Object} message - Message to broadcast
   */
  broadcastToRoom(brandId, taskId, message) {
    const roomId = `${brandId}-${taskId}`;
    
    if (this.roomConnections.has(roomId)) {
      const connections = this.roomConnections.get(roomId);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          this.sendMessage(ws, message);
        }
      });
    }
  }

  /**
   * Broadcast message to user
   * @param {string} userId - User ID
   * @param {Object} message - Message to broadcast
   */
  broadcastToUser(userId, message) {
    if (this.connections.has(userId)) {
      const userConnections = this.connections.get(userId);
      userConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          this.sendMessage(ws, message);
        }
      });
    }
  }

  /**
   * Send message to WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} message - Message to send
   */
  sendMessage(ws, message) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  /**
   * Broadcast comment added event
   * @param {string} brandId - Brand ID
   * @param {string} taskId - Task ID
   * @param {Object} comment - Comment object
   */
  broadcastCommentAdded(brandId, taskId, comment) {
    this.broadcastToRoom(brandId, taskId, {
      type: 'comment_added',
      taskId: taskId,
      comment: comment,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast comment updated event
   * @param {string} brandId - Brand ID
   * @param {string} taskId - Task ID
   * @param {Object} comment - Comment object
   */
  broadcastCommentUpdated(brandId, taskId, comment) {
    this.broadcastToRoom(brandId, taskId, {
      type: 'comment_updated',
      taskId: taskId,
      comment: comment,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast comment deleted event
   * @param {string} brandId - Brand ID
   * @param {string} taskId - Task ID
   * @param {string} commentId - Comment ID
   */
  broadcastCommentDeleted(brandId, taskId, commentId) {
    this.broadcastToRoom(brandId, taskId, {
      type: 'comment_deleted',
      taskId: taskId,
      commentId: commentId,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast activity added event
   * @param {string} brandId - Brand ID
   * @param {string} taskId - Task ID
   * @param {Object} activity - Activity object
   */
  broadcastActivityAdded(brandId, taskId, activity) {
    this.broadcastToRoom(brandId, taskId, {
      type: 'activity_added',
      taskId: taskId,
      activity: activity,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast mention notification
   * @param {string} userId - User ID
   * @param {Object} notification - Notification object
   */
  broadcastMentionNotification(userId, notification) {
    this.broadcastToUser(userId, {
      type: 'mention_notification',
      notification: notification,
      timestamp: Date.now()
    });
  }

  /**
   * Get active connections count
   * @returns {number} Active connections count
   */
  getActiveConnectionsCount() {
    return this.connections.size;
  }

  /**
   * Get room connections count
   * @param {string} brandId - Brand ID
   * @param {string} taskId - Task ID
   * @returns {number} Room connections count
   */
  getRoomConnectionsCount(brandId, taskId) {
    const roomId = `${brandId}-${taskId}`;
    return this.roomConnections.has(roomId) ? this.roomConnections.get(roomId).size : 0;
  }

  /**
   * Get user connections count
   * @param {string} userId - User ID
   * @returns {number} User connections count
   */
  getUserConnectionsCount(userId) {
    return this.connections.has(userId) ? this.connections.get(userId).size : 0;
  }

  /**
   * Generate unique connection ID
   * @returns {string} Connection ID
   */
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   * @returns {Object} Connection statistics
   */
  getConnectionStatistics() {
    return {
      totalConnections: this.connections.size,
      totalRooms: this.rooms.size,
      totalRoomConnections: Array.from(this.roomConnections.values()).reduce((sum, connections) => sum + connections.size, 0),
      activeUsers: this.connections.size,
      activeRooms: this.rooms.size
    };
  }

  /**
   * Clean up inactive connections
   */
  cleanupInactiveConnections() {
    const now = Date.now();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [userId, connections] of this.connections.entries()) {
      const activeConnections = new Set();
      
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          activeConnections.add(ws);
        }
      });
      
      if (activeConnections.size === 0) {
        this.connections.delete(userId);
      } else {
        this.connections.set(userId, activeConnections);
      }
    }
    
    console.log('Cleaned up inactive connections');
  }
}

module.exports = new RealtimeService();

