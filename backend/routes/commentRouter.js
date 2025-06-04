const express = require("express");
const router = express.Router();
const Photo = require("../db/photoModel");

function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        next();
    } else {
        res.status(401).json({ error: "Bạn cần đăng nhập để bình luận" });
    }
}

router.post("/commentsOfPhoto/:photo_id", authMiddleware, async (req, res) => {
    const photoId = req.params.photo_id;
    const { comment } = req.body;
    const userId = req.user && req.user.user_id;

    if (!comment || comment.trim() === "") {
        return res.status(400).json({ error: "Không thể thêm bình luận trống" });
    }

    if (!userId) {
        return res.status(401).json({ error: "Bạn cần đăng nhập để bình luận" });
    }

    try {
        const photo = await Photo.findById(photoId);
        if (!photo) {
            return res.status(404).json({ error: "Ảnh không tồn tại" });
        }

        const newComment = {
            user_id: userId,
            comment: comment.trim(),
            date_time: new Date(),
        };

        photo.comments.push(newComment);
        await photo.save();

        const updatedPhoto = await Photo.findById(photoId).populate(
            "comments.user_id",
            "first_name last_name"
        );

        return res.status(201).json({
            message: "Thêm bình luận thành công",
            photo: updatedPhoto,
        });
    } catch (error) {
        console.error("Lỗi khi thêm bình luận:", error);
        return res.status(500).json({ error: "Lỗi server" });
    }
});

module.exports = router;
