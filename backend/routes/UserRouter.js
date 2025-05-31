const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const router = express.Router();
router.post("/", async (request, response) => {
});

router.get("/list", async (request, response) => {
    try {
        const users = await User.find({}, '_id first_name last_name');
        response.status(200).json(users);
    } catch (error) {
        console.log(error);
        response.status(500).send({ message: "Lỗi khi lấy danh sách người dùng" });
    }
});
router.get("/me", async (req, res) => {
    if (!req.session.user || !req.session.user._id) {
        return res.status(401).json({ error: "Bạn cần đăng nhập." });
    }

    try {
        const user = await User.findById(req.session.user._id)
            .select("first_name last_name location description occupation");
        if (!user) {
            return res.status(404).json({ error: "Người dùng không tồn tại." });
        }
        res.json(user);
    } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
        res.status(500).json({ error: "Lỗi máy chủ." });
    }
});

router.put("/update", async (req, res) => {
    console.log("Session:", req.session); // debug

    if (!req.session.user || !req.session.user.user_id) {
        return res.status(401).json({ error: "Bạn cần đăng nhập." });
    }

    const { first_name, last_name, location, description, occupation } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.session.user.user_id,
            { first_name, last_name, location, description, occupation },
            { new: true }
        );
        res.json({ message: "Cập nhật thành công", user: updatedUser });
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        res.status(500).json({ error: "Lỗi máy chủ khi cập nhật thông tin." });
    }
});

router.get("/:id", async (request, response) => {
    const userId = request.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return response.status(400).send({ error: 'ID không hợp lệ.' });
    }

    try {
        const user = await User.findById(userId).select('_id first_name last_name location description occupation');
        if (!user) {
            return response.status(404).send({ message: "Người dùng không tồn tại." });
        }
        response.status(200).json(user);
    } catch (error) {
        console.log(error);
        response.status(500).send({ message: "Lỗi hiển thị thông tin người dùng" });
    }
});

module.exports = router;
