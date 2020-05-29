/**
 * Protect all authenticated routes
 * If a user is not authenticated then an error is returned
 * Otherwise, the next route handler is called
 */
exports.protect = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(400).json({ error: "Not authenticated" });
    }
}
