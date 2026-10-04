import { getCollection } from "./store.js";
import bcrypt from "bcryptjs";

/**
 * Mock models that mimic the Mongoose model interface.
 * Each model wraps a Collection from the in-memory store.
 */

function createMockModel(collectionName, hooks = {}) {
  const col = getCollection(collectionName);

  return {
    async findOne(query = {}) {
      return col.findOne(query);
    },

    async find(query = {}, options = {}) {
      // Handle .sort() chaining
      return col.find(query, options);
    },

    async findById(id) {
      return col.findOne({ _id: id });
    },

    async create(data) {
      const doc = { ...data };
      if (hooks.preCreate) await hooks.preCreate(doc);
      return col.create(doc);
    },

    async findOneAndUpdate(query, update, options = {}) {
      return col.findOneAndUpdate(query, update, options);
    },

    async findOneAndDelete(query) {
      return col.findOneAndDelete(query);
    },

    // Mongoose-style chainable query builder
    _query(query = {}) {
      const self = this;
      let _sortOptions = {};
      const chain = {
        sort(s) {
          _sortOptions = s;
          return chain;
        },
        async exec() {
          return col.find(query, { sort: _sortOptions });
        },
        then(resolve, reject) {
          chain.exec().then(resolve, reject);
        },
      };
      return chain;
    },
  };
}

// --- User Model ---

const userCol = getCollection("users");

function addComparePassword(doc) {
  if (!doc) return doc;
  doc.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
  return doc;
}

export const MockUser = {
  async findOne(query) {
    const col = getCollection("users");
    const doc = await col.findOne(query);
    return addComparePassword(doc);
  },

  async find(query = {}) {
    const col = getCollection("users");
    const docs = await col.find(query);
    return docs.map(addComparePassword);
  },

  async findById(id) {
    const col = getCollection("users");
    const doc = await col.findOne({ _id: id });
    return addComparePassword(doc);
  },

  async create(data) {
    const col = getCollection("users");
    const doc = { ...data };
    // Hash password before saving
    if (doc.password) {
      doc.password = await bcrypt.hash(doc.password, 10);
    }
    return col.create(doc);
  },
};

// --- LaundryTimings Model ---

export const MockLaundryTimings = createMockModel("laundrytimings");

export const MockNotification = createMockModel("notifications");

// --- LaundryBatch Model ---

const batchCol = getCollection("laundrybatches");

function attachSave(doc) {
  if (!doc || typeof doc.save === "function") return doc;
  doc.save = async function () {
    const idx = batchCol.docs.findIndex((d) => d._id === doc._id);
    if (idx !== -1) {
      const original = batchCol.docs[idx];
      if (doc.status && original.status && doc.status !== original.status) {
        doc.statusHistory = doc.statusHistory || [];
        const last = doc.statusHistory[doc.statusHistory.length - 1];
        if (!last || last.status !== doc.status) {
          doc.statusHistory.push({
            status: doc.status,
            updatedAt: new Date().toISOString(),
          });
        }
      }
      doc.updatedAt = new Date().toISOString();
      const stored = { ...doc };
      delete stored.save;
      batchCol.docs[idx] = stored;
    }
    return doc;
  };
  return doc;
}

export const MockLaundryBatch = {
  async findOne(query) {
    return batchCol.findOne(query);
  },

  async findById(id) {
    return batchCol.findOne({ _id: id });
  },

  async find(query = {}) {
    const docs = await batchCol.find(query);
    return docs.map((d) => attachSave(d));
  },

  async create(data) {
    const doc = { ...data };
    // Simulate pre-save: add statusHistory
    if (!doc.statusHistory) {
      doc.statusHistory = [
        { status: doc.status || "submitted", updatedAt: new Date().toISOString() },
      ];
    }
    return batchCol.create(doc);
  },

  async findOneAndUpdate(query, update, options = {}) {
    const doc = await batchCol.findOne(query);
    if (!doc) {
      if (options.upsert) {
        const newDoc = { ...query, ...update };
        if (!newDoc.statusHistory) {
          newDoc.statusHistory = [
            { status: newDoc.status || "submitted", updatedAt: new Date().toISOString() },
          ];
        }
        return batchCol.create(newDoc);
      }
      return null;
    }

    // Apply updates
    const updated = { ...doc, ...update, updatedAt: new Date().toISOString() };

    // If status changed, add to history
    if (update.status && update.status !== doc.status) {
      updated.statusHistory = [
        ...(doc.statusHistory || []),
        { status: update.status, updatedAt: new Date().toISOString() },
      ];
    }

    // Replace the doc in the collection
    const idx = batchCol.docs.findIndex((d) => d._id === doc._id);
    if (idx !== -1) {
      batchCol.docs[idx] = updated;
    }

    return options.new ? updated : doc;
  },

  async findOneAndDelete(query) {
    return batchCol.findOneAndDelete(query);
  },

  // Mongoose-style save instance method
  _saveInstance(doc) {
    return async function () {
      if (doc.isModified && doc.isModified("status")) {
        doc.statusHistory = doc.statusHistory || [];
        doc.statusHistory.push({
          status: doc.status,
          updatedAt: new Date().toISOString(),
        });
      }
      doc.updatedAt = new Date().toISOString();
      const idx = batchCol.docs.findIndex((d) => d._id === doc._id);
      if (idx !== -1) {
        batchCol.docs[idx] = { ...doc };
      }
      return doc;
    };
  },
};

// --- Service Model ---

const serviceCol = getCollection("services");

function addServiceMethods(doc) {
  if (!doc) return doc;
  doc.priceFor = function (size) {
    const key = `price${String(size || "").charAt(0).toUpperCase()}${String(size || "").slice(1).toLowerCase()}`;
    return this[key] || 0;
  };
  doc.save = async function () {
    const idx = serviceCol.docs.findIndex((d) => d._id === doc._id);
    if (idx !== -1) {
      doc.updatedAt = new Date().toISOString();
      serviceCol.docs[idx] = { ...doc };
    }
    return doc;
  };
  return doc;
}

export const MockService = {
  async findOne(query) {
    const doc = await serviceCol.findOne(query);
    return addServiceMethods(doc);
  },
  async findById(id) {
    const doc = await serviceCol.findOne({ _id: id });
    return addServiceMethods(doc);
  },
  async find(query = {}) {
    const docs = await serviceCol.find(query);
    return docs.map(addServiceMethods);
  },
  async create(data) {
    const doc = serviceCol.create(data);
    return addServiceMethods(doc);
  },
  async findOneAndUpdate(query, update, options = {}) {
    return serviceCol.findOneAndUpdate(query, update, options);
  },
  async findOneAndDelete(query) {
    return serviceCol.findOneAndDelete(query);
  },
};

// --- Coupon Model ---

const couponCol = getCollection("coupons");

function addCouponMethods(doc) {
  if (!doc) return doc;
  doc.validateForOrder = function (orderTotal) {
    if (!this.active) return { valid: false, reason: "Coupon is no longer active" };
    if (new Date() > new Date(this.expiryDate)) {
      return { valid: false, reason: "Coupon has expired" };
    }
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
      return { valid: false, reason: "Coupon usage limit reached" };
    }
    if (orderTotal < this.minOrderAmount) {
      return { valid: false, reason: `Minimum order of ₹${this.minOrderAmount} required` };
    }
    return { valid: true };
  };
  doc.calculateDiscount = function (subtotal) {
    if (this.discountType === "percentage") {
      return Math.round((subtotal * this.value) / 100);
    }
    return Math.min(this.value, subtotal);
  };
  doc.save = async function () {
    const idx = couponCol.docs.findIndex((d) => d._id === doc._id);
    if (idx !== -1) {
      doc.updatedAt = new Date().toISOString();
      couponCol.docs[idx] = { ...doc };
    }
    return doc;
  };
  return doc;
}

export const MockCoupon = {
  async findOne(query) {
    const doc = await couponCol.findOne(query);
    return addCouponMethods(doc);
  },
  async findById(id) {
    const doc = await couponCol.findOne({ _id: id });
    return addCouponMethods(doc);
  },
  async find(query = {}) {
    const docs = await couponCol.find(query);
    return docs.map(addCouponMethods);
  },
  async create(data) {
    return couponCol.create(data);
  },
  async findOneAndUpdate(query, update, options = {}) {
    return couponCol.findOneAndUpdate(query, update, options);
  },
  async findOneAndDelete(query) {
    return couponCol.findOneAndDelete(query);
  },
};

// --- Payment Model ---

const paymentCol = getCollection("payments");

function addPaymentSave(doc) {
  if (!doc) return doc;
  doc.save = async function () {
    const idx = paymentCol.docs.findIndex((d) => d._id === doc._id);
    if (idx !== -1) {
      doc.updatedAt = new Date().toISOString();
      paymentCol.docs[idx] = { ...doc };
    }
    return doc;
  };
  return doc;
}

export const MockPayment = {
  async findOne(query) {
    const doc = await paymentCol.findOne(query);
    return addPaymentSave(doc);
  },
  async findById(id) {
    const doc = await paymentCol.findOne({ _id: id });
    return addPaymentSave(doc);
  },
  async find(query = {}) {
    const docs = await paymentCol.find(query);
    return docs.map(addPaymentSave);
  },
  async create(data) {
    const doc = await paymentCol.create(data);
    return addPaymentSave(doc);
  },
  async findOneAndUpdate(query, update, options = {}) {
    return paymentCol.findOneAndUpdate(query, update, options);
  },
  async findOneAndDelete(query) {
    return paymentCol.findOneAndDelete(query);
  },
};

// --- Review Model ---

export const MockReview = createMockModel("reviews");
