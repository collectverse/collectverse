const connection = require("../schema/connection");
const errorMessages = {
    INTERNAL_ERROR: 'Erro interno do servidor.',
    NOT_HAVE_TASK: 'Não há um desafio selecionado.'
};
const incrementPercentage = require("../helpers/incrementPercentage");

// esta tudo errado, pq?
// não sei
// só aceita, fiquei 1 hora nessa merda aqui pra não funcionar absolutamente nada
// fds

class ChallengeHelpers {
    static async updateChallengeProgress(req, res, next, userId, challengeId, progress) {
        try {
            const [task] = await connection.query(
                "SELECT completionPercentage, points FROM challengesForUser INNER JOIN challenges on challengesForUser.challengeId = challenges.id WHERE challengesForUser.userId = ? AND challengesForUser.challengeId = ?",
                [userId, challengeId]
            );

            if (!task.length) {
                req.flash("error", errorMessages.NOT_HAVE_TASK);
                return res.status(404).redirect("/");
            }

            let percentage = Math.min(10, (parseFloat(task[0].completionPercentage) + parseFloat(progress)).toFixed(2));

            if (percentage >= 10) {
                const [account] = await connection.query("SELECT id, points FROM users WHERE id = ?", [userId]);
                const newPoints = parseInt(account[0].points) + parseInt(task[0].points);
                await connection.query("UPDATE users SET points = ?, updatedAt = NOW() WHERE id = ?", [newPoints, userId]);
                await connection.query("DELETE FROM challengesForUser WHERE userId = ? AND challengeId = ?", [userId, challengeId]);

                req.flash("success", "Desafio concluído! Tokens adicionados.");
                return res.redirect("/store/points");
            }

            await connection.query("UPDATE challengesForUser SET completionPercentage = ?, updatedAt = NOW() WHERE userId = ? AND challengeId = ?", [percentage, userId, challengeId]);
            next();
        } catch (error) {
            console.log(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/`);
        }
    }

    static async redeemChallenge(req, res, next, userId, challengeId) {
        try {
            const [task] = await connection.query(
                "SELECT id, completionPercentage FROM challengesForUser WHERE userId = ? AND challengeId = ?",
                [userId, challengeId]
            );

            if (!task.length) {
                req.flash("error", errorMessages.NOT_HAVE_TASK);
                return res.status(404).redirect("/store/points");
            }

            let progressForTask = 0;

            switch (challengeId) {
                case 1:
                    progressForTask = 10 / 5;  // Ex: 5 novas pessoas
                    break;
                case 2:
                    progressForTask = 10 / 3;  // Ex: 3 comentários
                    break;
                case 3:
                    progressForTask = 10 / 10
                    break;
                case 4:
                    progressForTask = 10 / 1
                    break;
                case 5:
                    progressForTask = 10 / 1
                    break;
                default:
                    progressForTask = 0;
                    break;
            }

            const updatedPercentage = Math.min(10, (parseFloat(task[0].completionPercentage) + parseFloat(progressForTask)).toFixed(2));

            await incrementPercentage(updatedPercentage, userId, challengeId);

            if (updatedPercentage >= 100) {
                await this.updateChallengeProgress(req, res, next, userId, challengeId, 0);
            } else {
                next();
            }
        } catch (error) {
            console.log(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/`);
        }
    }
}


module.exports = ChallengeHelpers;