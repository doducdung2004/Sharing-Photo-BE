const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const multer =  require("multer");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const path = require("path");
function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        console.log("User trong session:", req.session.user);
        req.user = req.session.user;
        next();
    } else {
        res.status(401).json({ error: "Bạn cần đăng nhập để tải ảnh" });
    }
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

router.post("/new",authMiddleware, upload.single("photo"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Không có file được tải lên" });
    }

    try {
        const newPhoto = new Photo({
            file_name: req.file.filename,
            date_time: new Date(),
            user_id: req.user.user_id
        });

        await newPhoto.save();

        res.status(200).json({ message: "Tải ảnh thành công", photo: newPhoto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi máy chủ khi lưu ảnh" });
    }
});
router.get("/profile",authMiddleware, (req, res) => {
    console.log("Session user:", req.session.user);
    res.json(req.session.user);
});
router.get("/photoOfUsers/:id", async (req, res) => {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send({ error: "ID không hợp lệ." });
    }

    try {

        const photos = await Photo.find({ user_id: new mongoose.Types.ObjectId(userId) }).lean();
        console.log("Photos found:", photos);
        const populatedPhotos = await Promise.all(
            photos.map(async (photo) => {
                const populatedComments = await Promise.all(
                    (photo.comments || []).map(async (comment) => {
                        const user = await User.findById(comment.user_id)
                            .select("_id first last_name")
                            .lean();

                        return {
                            _id: comment._id,
                            comment: comment.comment,
                            date_time: comment.date_time,
                            user: user || null,
                        };
                    })
                );

                return {
                    _id: photo._id,
                    user_id: photo.user_id,
                    file_name: photo.file_name,
                    date_time: photo.date_time,
                    comments: populatedComments,
                };
            })
        );

        res.status(200).json(populatedPhotos);
    } catch (error) {
        console.error("Lỗi khi lấy photoOfUsers:", error);
        res.status(500).send({ error: "Lỗi server." });
    }
});

module.exports = router;
