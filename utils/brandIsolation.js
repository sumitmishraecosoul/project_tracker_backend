/**
 * Brand Isolation Utilities
 * Provides functions to ensure data isolation between brands
 */

/**
 * Add brand filter to MongoDB query
 * @param {Object} query - MongoDB query object
 * @param {String} brandId - Brand ID to filter by
 * @param {Boolean} isAdminOverride - Whether admin override is active
 * @returns {Object} Modified query with brand filter
 */
const addBrandFilter = (query, brandId, isAdminOverride = false) => {
  // If admin override is active, don't add brand filter
  if (isAdminOverride) {
    return query;
  }

  // Add brand_id filter to ensure data isolation
  if (brandId) {
    query.brand_id = brandId;
  }

  return query;
};

/**
 * Add brand filter to aggregation pipeline
 * @param {Array} pipeline - MongoDB aggregation pipeline
 * @param {String} brandId - Brand ID to filter by
 * @param {Boolean} isAdminOverride - Whether admin override is active
 * @returns {Array} Modified pipeline with brand filter
 */
const addBrandFilterToPipeline = (pipeline, brandId, isAdminOverride = false) => {
  // If admin override is active, don't add brand filter
  if (isAdminOverride) {
    return pipeline;
  }

  // Add $match stage with brand_id filter at the beginning
  if (brandId) {
    pipeline.unshift({
      $match: { brand_id: brandId }
    });
  }

  return pipeline;
};

/**
 * Validate brand access for a resource
 * @param {String} resourceBrandId - Brand ID of the resource
 * @param {String} userBrandId - Brand ID from user context
 * @param {Boolean} isAdminOverride - Whether admin override is active
 * @returns {Boolean} Whether user has access to the resource
 */
const validateBrandAccess = (resourceBrandId, userBrandId, isAdminOverride = false) => {
  // Admin override allows access to any brand
  if (isAdminOverride) {
    return true;
  }

  // User can only access resources from their current brand
  return resourceBrandId && userBrandId && resourceBrandId.toString() === userBrandId.toString();
};

/**
 * Create brand-aware query options
 * @param {Object} options - Query options
 * @param {String} brandId - Brand ID
 * @param {Boolean} isAdminOverride - Whether admin override is active
 * @returns {Object} Modified options with brand context
 */
const createBrandAwareOptions = (options = {}, brandId, isAdminOverride = false) => {
  const brandAwareOptions = { ...options };

  // Add brand context to options if not admin override
  if (!isAdminOverride && brandId) {
    brandAwareOptions.brandId = brandId;
    brandAwareOptions.brandFilter = { brand_id: brandId };
  }

  return brandAwareOptions;
};

/**
 * Filter results by brand access
 * @param {Array} results - Array of results to filter
 * @param {String} brandId - Brand ID to filter by
 * @param {Boolean} isAdminOverride - Whether admin override is active
 * @returns {Array} Filtered results
 */
const filterResultsByBrand = (results, brandId, isAdminOverride = false) => {
  // If admin override is active, return all results
  if (isAdminOverride) {
    return results;
  }

  // Filter results by brand_id
  if (brandId) {
    return results.filter(result => {
      const resultBrandId = result.brand_id || result.brandId;
      return resultBrandId && resultBrandId.toString() === brandId.toString();
    });
  }

  return results;
};

/**
 * Add brand context to response data
 * @param {Object} data - Response data
 * @param {String} brandId - Brand ID
 * @param {Object} brand - Brand object
 * @returns {Object} Data with brand context
 */
const addBrandContextToResponse = (data, brandId, brand = null) => {
  const responseData = { ...data };
  
  if (brandId) {
    responseData.brandId = brandId;
  }

  if (brand) {
    responseData.brand = {
      id: brand._id,
      name: brand.name,
      slug: brand.slug,
      status: brand.status
    };
  }

  return responseData;
};

/**
 * Create brand-aware error response
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @param {String} brandId - Brand ID for context
 * @returns {Object} Error response with brand context
 */
const createBrandAwareError = (message, code, brandId = null) => {
  const error = {
    success: false,
    error: {
      code: code,
      message: message
    }
  };

  if (brandId) {
    error.brandId = brandId;
  }

  return error;
};

/**
 * Validate brand ID format
 * @param {String} brandId - Brand ID to validate
 * @returns {Boolean} Whether brand ID is valid
 */
const isValidBrandId = (brandId) => {
  if (!brandId) return false;
  
  // Check if it's a valid MongoDB ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(brandId);
};

/**
 * Create brand isolation middleware
 * @param {String} brandIdField - Field name to check for brand ID (default: 'brand_id')
 * @returns {Function} Middleware function
 */
const createBrandIsolationMiddleware = (brandIdField = 'brand_id') => {
  return (req, res, next) => {
    try {
      // Skip brand isolation if admin override is active
      if (req.isAdminOverride) {
        return next();
      }

      // Ensure brand context is available
      if (!req.brandId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_BRAND_CONTEXT',
            message: 'Brand context is required for this operation'
          }
        });
      }

      // Add brand filter to request for use in controllers
      req.brandFilter = { [brandIdField]: req.brandId };
      req.brandIsolation = {
        brandId: req.brandId,
        isAdminOverride: req.isAdminOverride || false,
        filter: { [brandIdField]: req.brandId }
      };

      next();
    } catch (error) {
      console.error('Brand isolation middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BRAND_ISOLATION_ERROR',
          message: 'Failed to process brand isolation',
          details: error.message
        }
      });
    }
  };
};

module.exports = {
  addBrandFilter,
  addBrandFilterToPipeline,
  validateBrandAccess,
  createBrandAwareOptions,
  filterResultsByBrand,
  addBrandContextToResponse,
  createBrandAwareError,
  isValidBrandId,
  createBrandIsolationMiddleware
};
