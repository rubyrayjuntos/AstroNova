/**
 * SAT.js - Separating Axis Theorem collision detection library
 * Lightweight implementation for convex polygon collision detection
 */

const SAT = {
    /**
     * Test collision between two polygons
     * @param {Object} poly1 - First polygon with points array
     * @param {Object} poly2 - Second polygon with points array
     * @returns {boolean} - True if collision detected
     */
    testPolygonPolygon: function(poly1, poly2) {
        const axes1 = this.getAxes(poly1.points);
        const axes2 = this.getAxes(poly2.points);
        
        // Test all axes from both polygons
        for (let axis of axes1) {
            if (!this.overlapOnAxis(poly1.points, poly2.points, axis)) {
                return false;
            }
        }
        
        for (let axis of axes2) {
            if (!this.overlapOnAxis(poly1.points, poly2.points, axis)) {
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Get the axes (normal vectors) for a polygon
     * @param {Array} points - Array of {x, y} points
     * @returns {Array} - Array of normalized axis vectors
     */
    getAxes: function(points) {
        const axes = [];
        
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            const edge = {
                x: p2.x - p1.x,
                y: p2.y - p1.y
            };
            
            // Normal vector (perpendicular to edge)
            const normal = {
                x: -edge.y,
                y: edge.x
            };
            
            // Normalize the vector
            const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            if (length > 0) {
                normal.x /= length;
                normal.y /= length;
            }
            
            axes.push(normal);
        }
        
        return axes;
    },
    
    /**
     * Check if two polygons overlap when projected onto an axis
     * @param {Array} points1 - First polygon points
     * @param {Array} points2 - Second polygon points
     * @param {Object} axis - Normalized axis vector
     * @returns {boolean} - True if overlap detected
     */
    overlapOnAxis: function(points1, points2, axis) {
        const proj1 = this.project(points1, axis);
        const proj2 = this.project(points2, axis);
        
        return !(proj1.max < proj2.min || proj2.max < proj1.min);
    },
    
    /**
     * Project polygon points onto an axis
     * @param {Array} points - Polygon points
     * @param {Object} axis - Normalized axis vector
     * @returns {Object} - Min and max projection values
     */
    project: function(points, axis) {
        let min = this.dotProduct(points[0], axis);
        let max = min;
        
        for (let i = 1; i < points.length; i++) {
            const proj = this.dotProduct(points[i], axis);
            if (proj < min) min = proj;
            if (proj > max) max = proj;
        }
        
        return { min, max };
    },
    
    /**
     * Calculate dot product of two vectors
     * @param {Object} v1 - First vector
     * @param {Object} v2 - Second vector
     * @returns {number} - Dot product result
     */
    dotProduct: function(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
}; 