import bcrypt from "bcryptjs";
import User from "../../domain/models/user.model.js";

async function createBootstrapAdmin() {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!username || !password) {
    console.log("Bootstrap admin credentials not configured");
    return;
  }

  const adminExists = await User.findOne({ username }).setOptions({
    includeDeleted: true,
  });

  if (adminExists) {
    if (adminExists.isDeleted) {
      console.log("Admin exists but is soft-deleted. Restoring...");

      adminExists.isDeleted = false;
      adminExists.deletedAt = null;
      adminExists.updatedAt = new Date();

      await adminExists.save();
    } else {
      console.log("Admin already exists and is active");
    }

    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const admin = new User({
      username,
      address: "N/A",
      phone: "",
      passwordHash,
      role: "owner",
    });

    await admin.save();

    console.log("Bootstrap admin created");
  } catch (error) {
    if (error.code === 11000) {
      console.log("Race condition: admin created by another instance");
    } else {
      throw error;
    }
  }
}

export default createBootstrapAdmin;
