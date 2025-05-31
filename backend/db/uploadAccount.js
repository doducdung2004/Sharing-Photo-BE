const connectDB = require("./dbConnect");
const Account = require("./accountModel"); // đường dẫn đúng tới file model



const uploadData = async () => {
    try {
        await connectDB();
        await Account.insertMany(newAccounts);
        console.log("Tài khoản đã được thêm!");
    } catch (error) {
        console.error("Lỗi khi thêm tài khoản:", error);
    } finally {
        process.exit(); // kết thúc chương trình
    }
};

uploadData();
