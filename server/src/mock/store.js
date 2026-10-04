import crypto from "crypto";

/**
 * In-memory store that mimics Mongoose model operations.
 * Used when MOCK_MODE=true so the app works without MongoDB.
 */

class Collection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  _generateId() {
    return crypto.randomBytes(12).toString("hex");
  }

  _matchesQuery(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      if (key === "$or") {
        const matchAny = value.some((subQuery) =>
          this._matchesQuery(doc, subQuery)
        );
        if (!matchAny) return false;
        continue;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Handle operators like $regex, $in, etc.
        for (const [op, opVal] of Object.entries(value)) {
          if (op === "$regex") {
            if (!new RegExp(opVal).test(doc[key])) return false;
          } else if (op === "$in") {
            if (!opVal.includes(doc[key])) return false;
          } else if (op === "$ne") {
            if (doc[key] === opVal) return false;
          }
        }
      } else {
        if (doc[key] !== value) return false;
      }
    }
    return true;
  }

  _clone(doc) {
    return JSON.parse(JSON.stringify(doc));
  }

  async find(query = {}, options = {}) {
    let results = this.docs.filter((d) => this._matchesQuery(d, query));
    if (options.sort) {
      const [field, dir] = Object.entries(options.sort)[0];
      results.sort((a, b) =>
        dir === -1
          ? new Date(b[field]) - new Date(a[field])
          : new Date(a[field]) - new Date(b[field])
      );
    }
    return results.map((d) => this._clone(d));
  }

  async findOne(query = {}) {
    const self = this;
    const doc = this.docs.find((d) => this._matchesQuery(d, query));
    if (!doc) return null;
    const cloned = this._clone(doc);
    // Attach a .save() method so Mongoose-style instance methods work
    cloned.save = async function () {
      const idx = self.docs.findIndex((d) => d._id === cloned._id);
      if (idx !== -1) {
        const original = self.docs[idx];
        // For LaundryBatch: auto-add status to history if status changed
        if (
          self.name === "laundrybatches" &&
          cloned.status !== original.status
        ) {
          cloned.statusHistory = cloned.statusHistory || [];
          cloned.statusHistory.push({
            status: cloned.status,
            note: cloned.note || "",
            updatedAt: new Date().toISOString(),
          });
        }
        cloned.updatedAt = new Date().toISOString();
        // Remove the save method before storing
        const stored = { ...cloned };
        delete stored.save;
        self.docs[idx] = stored;
      }
      return cloned;
    };
    return cloned;
  }

  async create(data) {
    const doc = {
      _id: this._generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Handle pre-save hooks for LaundryBatch (add statusHistory)
    if (this.name === "laundrybatches" && !doc.statusHistory) {
      doc.statusHistory = [{ status: doc.status || "submitted", updatedAt: new Date().toISOString() }];
    }
    this.docs.push(doc);
    return this._clone(doc);
  }

  async findOneAndUpdate(query, update, options = {}) {
    const idx = this.docs.findIndex((d) => this._matchesQuery(d, query));
    if (idx === -1) {
      if (options.upsert) {
        const newDoc = { _id: this._generateId(), ...query };
        // Apply $set style updates
        for (const [key, value] of Object.entries(update)) {
          newDoc[key] = value;
        }
        newDoc.createdAt = new Date().toISOString();
        newDoc.updatedAt = new Date().toISOString();
        this.docs.push(newDoc);
        return this._clone(newDoc);
      }
      return null;
    }
    for (const [key, value] of Object.entries(update)) {
      this.docs[idx][key] = value;
    }
    this.docs[idx].updatedAt = new Date().toISOString();
    return options.new ? this._clone(this.docs[idx]) : this._clone(this.docs[idx]);
  }

  async findOneAndDelete(query) {
    const idx = this.docs.findIndex((d) => this._matchesQuery(d, query));
    if (idx === -1) return null;
    const [deleted] = this.docs.splice(idx, 1);
    return this._clone(deleted);
  }

  async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      this.docs = [];
      return { deletedCount: 0 };
    }
    const before = this.docs.length;
    this.docs = this.docs.filter((d) => !this._matchesQuery(d, query));
    return { deletedCount: before - this.docs.length };
  }

  countDocuments() {
    return this.docs.length;
  }
}

// Singleton collections
const collections = {};

export function getCollection(name) {
  if (!collections[name]) {
    collections[name] = new Collection(name);
  }
  return collections[name];
}

export function getAllCollections() {
  return collections;
}
