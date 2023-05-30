const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
 GuildID: String,
 MembersID: [String],
 TicketID: String,
 ChannelID: String,
 Closed:Boolean,
 Locked:Boolean,
 Type:String,
 Claimed: Boolean,
 ClaimedBy: String,
});

module.exports = mongoose.model("tickets", ticketSchema);