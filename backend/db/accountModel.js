const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        username : {
            type: String,
            required: true, unique: true
        },
        password : {
            type: String,
            required: true
        },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    }
)
module.exports = mongoose.models.Account || mongoose.model("Account", accountSchema);