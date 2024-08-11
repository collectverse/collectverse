const connect  = require("../schema/connection");

async function incrementPercentage(percentage, userId, challengeId) {
    return await connect.query(
        "UPDATE challengesForUser SET completionPercentage = ?, updatedAt = NOW() WHERE userId = ? AND challengeId = ?", [percentage, userId, challengeId]
    );
}

module.exports = incrementPercentage;