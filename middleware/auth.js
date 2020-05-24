exports.protect = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(400).json({ error: "Not authenticated" });
    }
}
