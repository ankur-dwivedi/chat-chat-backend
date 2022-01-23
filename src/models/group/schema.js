const { Schema } = require("mongoose");
const { PropertiesSchema } = require("./utils");

const GroupSchema = new Schema({
  name: { type: String, required: true },
  employees: [{ type: Schema.Types.ObjectId, ref: "user" }],
  organization: { type: Schema.Types.ObjectId, trim: true, ref: "organization" },
  description: { type: String },
  properties: { type: [PropertiesSchema] },
  createdAt: { type: Date, required: true },
  upatedAt: { type: Date },
});

module.exports = GroupSchema;
