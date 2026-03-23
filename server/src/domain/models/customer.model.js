import mongoose from "mongoose";

import {
  blindIndex,
  decrypt,
  encrypt,
} from "../../infrastructure/security/encryption.service.js";
import softDeletePlugin from "../plugins/softDelete.plugin.js";

const normalizePhone = (phone) => phone.replace(/\D/g, "");

const customerSchema = new mongoose.Schema(
  {
    nameEncrypted: String,
    phoneEncrypted: String,
    phoneBlindIndex: String,

    addressEncrypted: String,

    // passwordHash: {
    //   type: String,
    //   required: true,
    // },

    role: {
      type: String,
      default: "customer",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Virtual plaintext fields
|--------------------------------------------------------------------------
*/

customerSchema
  .virtual("name")
  .get(function () {
    return this.nameEncrypted ? decrypt(this.nameEncrypted) : null;
  })
  .set(function (value) {
    if (value === undefined || value === null) return;

    const safe = String(value).trim();

    if (!safe) return;

    this.nameEncrypted = encrypt(safe);
  });

customerSchema
  .virtual("phone")
  .get(function () {
    return this.phoneEncrypted ? decrypt(this.phoneEncrypted) : null;
  })
  .set(function (value) {
    if (value === undefined || value === null) return;

    const normalized = normalizePhone(String(value));

    if (!normalized) return;

    this.phoneBlindIndex = blindIndex(normalized);
    this.phoneEncrypted = encrypt(normalized);
  });

customerSchema
  .virtual("address")
  .get(function () {
    return this.addressEncrypted ? decrypt(this.addressEncrypted) : null;
  })
  .set(function (value) {
    if (value === undefined || value === null) return;

    const safe = String(value).trim();

    if (!safe) return;

    this.addressEncrypted = encrypt(safe);
  });

/*
|--------------------------------------------------------------------------
| Unique index for phone (ignores soft-deleted customers)
|--------------------------------------------------------------------------
*/

customerSchema.index(
  { phoneBlindIndex: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

/*
|--------------------------------------------------------------------------
| Validate required plaintext fields
|--------------------------------------------------------------------------
*/

customerSchema.pre("validate", function () {
  if (!this.nameEncrypted) {
    this.invalidate("name", "Name is required");
  }

  if (!this.phoneEncrypted) {
    this.invalidate("phone", "Phone is required");
  }
});

/*
|--------------------------------------------------------------------------
| Hide encrypted fields in API responses
|--------------------------------------------------------------------------
*/

customerSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    // Keep _id and id (virtual)
    delete ret.nameEncrypted;
    delete ret.phoneEncrypted;
    delete ret.addressEncrypted;
    delete ret.phoneBlindIndex;
    // delete ret.passwordHash;

    return ret;
  },
});

/*
|--------------------------------------------------------------------------
| Plugins
|--------------------------------------------------------------------------
*/

customerSchema.plugin(softDeletePlugin);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
