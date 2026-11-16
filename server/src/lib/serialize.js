/** Serialisers shared by every route so no response can leak a password. */

export function toPlain(doc) {
  if (!doc) return doc;
  if (typeof doc.toObject === "function") return doc.toObject();
  return doc._doc ? doc._doc : { ...doc };
}

export function publicUser(user) {
  if (!user) return user;
  const safe = { ...toPlain(user) };
  delete safe.password;
  delete safe.comparePassword;
  return safe;
}
