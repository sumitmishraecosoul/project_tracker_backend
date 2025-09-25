const marked = require('marked');
const cheerio = require('cheerio');

class MarkdownService {
  constructor() {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false, // We'll handle sanitization separately
      smartLists: true,
      smartypants: true
    });
  }

  /**
   * Convert markdown to HTML
   * @param {string} markdown - Markdown content
   * @returns {string} HTML content
   */
  convertToHtml(markdown) {
    try {
      if (!markdown || typeof markdown !== 'string') {
        return '';
      }

      // Convert markdown to HTML
      const html = marked.parse(markdown);
      
      // Sanitize HTML
      const sanitizedHtml = this.sanitizeHtml(html);
      
      return sanitizedHtml;
    } catch (error) {
      console.error('Error converting markdown to HTML:', error);
      return markdown; // Return original if conversion fails
    }
  }

  /**
   * Sanitize HTML content
   * @param {string} html - HTML content
   * @returns {string} Sanitized HTML
   */
  sanitizeHtml(html) {
    try {
      const $ = cheerio.load(html);
      
      // Remove potentially dangerous tags and attributes
      $('script').remove();
      $('iframe').remove();
      $('object').remove();
      $('embed').remove();
      $('form').remove();
      $('input').remove();
      $('button').remove();
      
      // Remove dangerous attributes
      $('*').removeAttr('onclick');
      $('*').removeAttr('onload');
      $('*').removeAttr('onerror');
      $('*').removeAttr('onmouseover');
      $('*').removeAttr('onmouseout');
      $('*').removeAttr('onfocus');
      $('*').removeAttr('onblur');
      $('*').removeAttr('onchange');
      $('*').removeAttr('onsubmit');
      $('*').removeAttr('onreset');
      $('*').removeAttr('onselect');
      $('*').removeAttr('onkeydown');
      $('*').removeAttr('onkeyup');
      $('*').removeAttr('onkeypress');
      
      // Clean up links to prevent XSS
      $('a').each(function() {
        const href = $(this).attr('href');
        if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          $(this).attr('href', '#');
        }
      });
      
      return $.html();
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      return html; // Return original if sanitization fails
    }
  }

  /**
   * Extract links from markdown content
   * @param {string} markdown - Markdown content
   * @returns {Array} Array of link objects
   */
  extractLinks(markdown) {
    try {
      if (!markdown || typeof markdown !== 'string') {
        return [];
      }

      const links = [];
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      
      let match;
      
      // Extract markdown links [text](url)
      while ((match = linkRegex.exec(markdown)) !== null) {
        const text = match[1];
        const url = match[2];
        links.push({
          url: url,
          title: text,
          type: this.getLinkType(url),
          preview: this.generateLinkPreview(url, text)
        });
      }
      
      // Extract plain URLs
      while ((match = urlRegex.exec(markdown)) !== null) {
        const url = match[1];
        // Skip if already captured as markdown link
        if (!links.some(link => link.url === url)) {
          links.push({
            url: url,
            title: this.extractDomainFromUrl(url),
            type: this.getLinkType(url),
            preview: this.generateLinkPreview(url, this.extractDomainFromUrl(url))
          });
        }
      }
      
      return links;
    } catch (error) {
      console.error('Error extracting links:', error);
      return [];
    }
  }

  /**
   * Extract mentions from markdown content
   * @param {string} markdown - Markdown content
   * @returns {Array} Array of mention objects
   */
  extractMentions(markdown) {
    try {
      if (!markdown || typeof markdown !== 'string') {
        return [];
      }

      const mentions = [];
      const mentionRegex = /@(\w+)/g;
      
      let match;
      while ((match = mentionRegex.exec(markdown)) !== null) {
        const username = match[1];
        const position = match.index;
        const length = match[0].length;
        
        mentions.push({
          username: username,
          position: position,
          length: length
        });
      }
      
      return mentions;
    } catch (error) {
      console.error('Error extracting mentions:', error);
      return [];
    }
  }

  /**
   * Get link type based on URL
   * @param {string} url - URL to analyze
   * @returns {string} Link type
   */
  getLinkType(url) {
    if (!url || typeof url !== 'string') {
      return 'external';
    }

    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('onedrive.live.com') || lowerUrl.includes('1drv.ms')) {
      return 'onedrive';
    } else if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com') || lowerUrl.includes('sheets.google.com')) {
      return 'googledrive';
    } else if (lowerUrl.includes('dropbox.com')) {
      return 'dropbox';
    } else if (lowerUrl.includes('github.com')) {
      return 'github';
    } else if (lowerUrl.includes('bitbucket.org')) {
      return 'bitbucket';
    } else if (lowerUrl.includes('gitlab.com')) {
      return 'gitlab';
    } else {
      return 'external';
    }
  }

  /**
   * Generate link preview
   * @param {string} url - URL
   * @param {string} title - Link title
   * @returns {Object} Link preview object
   */
  generateLinkPreview(url, title) {
    try {
      const domain = this.extractDomainFromUrl(url);
      
      return {
        domain: domain,
        title: title || domain,
        description: `Link to ${domain}`,
        image: null // Could be enhanced to fetch actual preview images
      };
    } catch (error) {
      console.error('Error generating link preview:', error);
      return {
        domain: 'unknown',
        title: title || 'Link',
        description: 'External link',
        image: null
      };
    }
  }

  /**
   * Extract domain from URL
   * @param {string} url - URL
   * @returns {string} Domain
   */
  extractDomainFromUrl(url) {
    try {
      if (!url || typeof url !== 'string') {
        return 'unknown';
      }

      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('Error extracting domain:', error);
      return 'unknown';
    }
  }

  /**
   * Process comment content (markdown to HTML + extract metadata)
   * @param {string} content - Markdown content
   * @returns {Object} Processed content with HTML and metadata
   */
  processContent(content) {
    try {
      if (!content || typeof content !== 'string') {
        return {
          content: '',
          contentHtml: '',
          links: [],
          mentions: []
        };
      }

      const contentHtml = this.convertToHtml(content);
      const links = this.extractLinks(content);
      const mentions = this.extractMentions(content);

      return {
        content: content,
        contentHtml: contentHtml,
        links: links,
        mentions: mentions
      };
    } catch (error) {
      console.error('Error processing content:', error);
      return {
        content: content,
        contentHtml: content,
        links: [],
        mentions: []
      };
    }
  }

  /**
   * Validate markdown content
   * @param {string} content - Markdown content
   * @returns {Object} Validation result
   */
  validateContent(content) {
    try {
      if (!content || typeof content !== 'string') {
        return {
          isValid: false,
          errors: ['Content is required']
        };
      }

      const errors = [];
      
      // Check content length
      if (content.length > 5000) {
        errors.push('Content exceeds maximum length of 5000 characters');
      }
      
      // Check for potentially dangerous content
      if (content.includes('<script>') || content.includes('javascript:')) {
        errors.push('Content contains potentially dangerous scripts');
      }
      
      // Check for excessive links
      const links = this.extractLinks(content);
      if (links.length > 10) {
        errors.push('Content contains too many links (maximum 10)');
      }
      
      // Check for excessive mentions
      const mentions = this.extractMentions(content);
      if (mentions.length > 20) {
        errors.push('Content contains too many mentions (maximum 20)');
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors
      };
    } catch (error) {
      console.error('Error validating content:', error);
      return {
        isValid: false,
        errors: ['Content validation failed']
      };
    }
  }

  /**
   * Get markdown statistics
   * @param {string} content - Markdown content
   * @returns {Object} Statistics
   */
  getContentStatistics(content) {
    try {
      if (!content || typeof content !== 'string') {
        return {
          characterCount: 0,
          wordCount: 0,
          linkCount: 0,
          mentionCount: 0,
          lineCount: 0
        };
      }

      const links = this.extractLinks(content);
      const mentions = this.extractMentions(content);
      const lines = content.split('\n');
      
      return {
        characterCount: content.length,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        linkCount: links.length,
        mentionCount: mentions.length,
        lineCount: lines.length
      };
    } catch (error) {
      console.error('Error getting content statistics:', error);
      return {
        characterCount: 0,
        wordCount: 0,
        linkCount: 0,
        mentionCount: 0,
        lineCount: 0
      };
    }
  }
}

module.exports = new MarkdownService();

