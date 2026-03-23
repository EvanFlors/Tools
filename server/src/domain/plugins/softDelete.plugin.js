const softDeletePlugin = (schema) => {

  /* ======================================
     Fields
  ====================================== */

  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  });

  /* ======================================
     Instance Methods
  ====================================== */

  schema.methods.softDelete = async function () {

    if (this.isDeleted) return this;

    this.isDeleted = true;
    this.deletedAt = new Date();

    return this.save();
  };

  schema.methods.restore = async function () {

    if (!this.isDeleted) return this;

    this.isDeleted = false;
    this.deletedAt = null;

    return this.save();
  };

  /* ======================================
     Static Methods
  ====================================== */

  schema.statics.softDeleteById = function (id) {
    return this.updateOne(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
  };

  schema.statics.restoreById = function (id) {
    return this.updateOne(
      { _id: id, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );
  };

  schema.statics.softDeleteMany = function (filter) {
    return this.updateMany(
      { ...filter, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
  };

  schema.statics.restoreMany = function (filter) {
    return this.updateMany(
      { ...filter, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } }
    );
  };

  /* ======================================
     Query Helpers
  ====================================== */

  schema.query.withDeleted = function () {
    return this.setOptions({ includeDeleted: true });
  };

  schema.query.onlyDeleted = function () {
    return this.where({ isDeleted: true }).setOptions({ includeDeleted: true });
  };

  /* ======================================
     Query Middleware
  ====================================== */

  const autoFilter = function () {

    const options = this.getOptions?.() || {};

    if (!options.includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }

    if (options.includeDeleted) {
      delete options.includeDeleted;
    }
  };

  schema.pre(/^find/, autoFilter);
  schema.pre("countDocuments", autoFilter);
  schema.pre("distinct", autoFilter);

  /* ======================================
     Aggregation Middleware
  ====================================== */

  schema.pre("aggregate", function () {

    const pipeline = this.pipeline();

    const includeDeletedStage = pipeline.find(
      stage => stage.$match?.includeDeleted === true
    );

    const includeDeleted = Boolean(includeDeletedStage);

    if (!includeDeleted) {

      const matchStage = { $match: { isDeleted: { $ne: true } } };

      if (pipeline.length === 0) {
        pipeline.push(matchStage);
        return;
      }

      const firstStage = pipeline[0];

      if (firstStage?.$geoNear || firstStage?.$search) {
        pipeline.splice(1, 0, matchStage);
      } else {
        pipeline.unshift(matchStage);
      }

    } else {

      for (const stage of pipeline) {
        if (stage.$match?.includeDeleted) {
          delete stage.$match.includeDeleted;
        }
      }

    }

  });

};

export default softDeletePlugin;