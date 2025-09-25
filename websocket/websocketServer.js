const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Brand = require('../models/Brand');
const realtimeService = require('../services/realtimeService');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/api/ws',
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.setupEventHandlers();
    console.log('WebSocket server initialized');
  }

  /**
   * Verify WebSocket client connection
   * @param {Object} info - Client info
   * @returns {boolean} Whether client is authorized
   */
  async verifyClient(info) {
    try {
      const url = new URL(info.req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('WebSocket connection rejected: No token provided');
        return false;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user exists and is active
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        console.log('WebSocket connection rejected: Invalid user');
        return false;
      }

      // Store user info in request for later use
      info.req.user = user;
      info.req.brandId = decoded.brandId;
      
      return true;
    } catch (error) {
      console.log('WebSocket connection rejected:', error.message);
      return false;
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const user = req.user;
      const brandId = req.brandId;
      
      if (!user) {
        console.log('WebSocket connection rejected: No user found');
        ws.close(1008, 'No user found');
        return;
      }
      
      console.log(`WebSocket connection established for user ${user.name} (${user.email}) in brand ${brandId}`);
      
      // Add connection to realtime service
      const connectionId = realtimeService.addConnection(ws, user._id, brandId);
      
      // Send welcome message
      this.sendMessage(ws, {
        type: 'connected',
        message: 'WebSocket connection established',
        userId: user._id,
        brandId: brandId,
        connectionId: connectionId,
        timestamp: Date.now()
      });

      // Handle connection close
      ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed for user ${user.name}: ${code} - ${reason}`);
        realtimeService.removeConnection(ws, user._id);
      });

      // Handle connection error
      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${user.name}:`, error);
        realtimeService.removeConnection(ws, user._id);
      });

      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, user, brandId, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          this.sendMessage(ws, {
            type: 'error',
            message: 'Invalid message format',
            timestamp: Date.now()
          });
        }
      });

      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          this.sendMessage(ws, {
            type: 'ping',
            timestamp: Date.now()
          });
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // Ping every 30 seconds

      // Clean up interval on connection close
      ws.on('close', () => {
        clearInterval(pingInterval);
      });
    });
  }

  /**
   * Handle incoming WebSocket message
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} user - User object
   * @param {string} brandId - Brand ID
   * @param {Object} message - Message object
   */
  async handleMessage(ws, user, brandId, message) {
    try {
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscribe(ws, user, brandId, message);
          break;
        case 'unsubscribe':
          await this.handleUnsubscribe(ws, user, brandId, message);
          break;
        case 'ping':
          this.sendMessage(ws, { type: 'pong', timestamp: Date.now() });
          break;
        case 'get_connection_info':
          this.sendMessage(ws, {
            type: 'connection_info',
            userId: user._id,
            brandId: brandId,
            timestamp: Date.now()
          });
          break;
        default:
          console.warn(`Unknown WebSocket message type: ${message.type}`);
          this.sendMessage(ws, {
            type: 'error',
            message: `Unknown message type: ${message.type}`,
            timestamp: Date.now()
          });
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendMessage(ws, {
        type: 'error',
        message: 'Failed to process message',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle subscription request
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} user - User object
   * @param {string} brandId - Brand ID
   * @param {Object} message - Message object
   */
  async handleSubscribe(ws, user, brandId, message) {
    try {
      const { taskId, projectId, subscriptionType } = message;
      
      if (!taskId) {
        this.sendMessage(ws, {
          type: 'error',
          message: 'Task ID is required for subscription',
          timestamp: Date.now()
        });
        return;
      }

      // Verify user has access to the task
      const hasAccess = await this.verifyTaskAccess(user._id, brandId, taskId);
      if (!hasAccess) {
        this.sendMessage(ws, {
          type: 'error',
          message: 'Access denied to task',
          timestamp: Date.now()
        });
        return;
      }

      // Create subscription
      const subscription = await realtimeService.handleSubscribe(ws, user._id, message);
      
      this.sendMessage(ws, {
        type: 'subscribed',
        taskId: taskId,
        projectId: projectId,
        brandId: brandId,
        subscriptionType: subscriptionType || 'all',
        timestamp: Date.now()
      });
      
      console.log(`User ${user.name} subscribed to task ${taskId} in brand ${brandId}`);
    } catch (error) {
      console.error('Error handling subscription:', error);
      this.sendMessage(ws, {
        type: 'error',
        message: 'Failed to subscribe',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle unsubscription request
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} user - User object
   * @param {string} brandId - Brand ID
   * @param {Object} message - Message object
   */
  async handleUnsubscribe(ws, user, brandId, message) {
    try {
      const { taskId } = message;
      
      if (!taskId) {
        this.sendMessage(ws, {
          type: 'error',
          message: 'Task ID is required for unsubscription',
          timestamp: Date.now()
        });
        return;
      }

      // Handle unsubscription
      await realtimeService.handleUnsubscribe(ws, user._id, message);
      
      this.sendMessage(ws, {
        type: 'unsubscribed',
        taskId: taskId,
        brandId: brandId,
        timestamp: Date.now()
      });
      
      console.log(`User ${user.name} unsubscribed from task ${taskId} in brand ${brandId}`);
    } catch (error) {
      console.error('Error handling unsubscription:', error);
      this.sendMessage(ws, {
        type: 'error',
        message: 'Failed to unsubscribe',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verify user has access to task
   * @param {string} userId - User ID
   * @param {string} brandId - Brand ID
   * @param {string} taskId - Task ID
   * @returns {boolean} Whether user has access
   */
  async verifyTaskAccess(userId, brandId, taskId) {
    try {
      // This would typically check if user is assigned to task or has brand access
      // For now, we'll assume all users in a brand have access to tasks in that brand
      return true;
    } catch (error) {
      console.error('Error verifying task access:', error);
      return false;
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
   * Broadcast message to all connected clients
   * @param {Object} message - Message to broadcast
   */
  broadcast(message) {
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendMessage(ws, message);
      }
    });
  }

  /**
   * Broadcast message to specific brand
   * @param {string} brandId - Brand ID
   * @param {Object} message - Message to broadcast
   */
  broadcastToBrand(brandId, message) {
    this.wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN && ws.brandId === brandId) {
        this.sendMessage(ws, message);
      }
    });
  }

  /**
   * Get connection statistics
   * @returns {Object} Connection statistics
   */
  getStatistics() {
    return {
      totalConnections: this.wss.clients.size,
      readyState: this.wss.readyState,
      ...realtimeService.getConnectionStatistics()
    };
  }

  /**
   * Close WebSocket server
   */
  close() {
    this.wss.close();
    console.log('WebSocket server closed');
  }
}

module.exports = WebSocketServer;
