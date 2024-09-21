const connection = require("../schema/connection");
const errorMessages = {
    INTERNAL_ERROR: 'Erro interno do servidor.',
    NOT_HAVE_TASK: 'Não há um desafio selecionado.'
};
const incrementPercentage = require("../helpers/incrementPercentage");

class ChallengeHelpers {
    static async updateChallengeProgress(req, res, next, userId, challengeId, progress) {
        try {
            const [task] = await connection.query(
                "SELECT completionPercentage, points FROM challengesForUser INNER JOIN challenges ON challengesForUser.challengeId = challenges.id WHERE challengesForUser.userId = ? AND challengesForUser.challengeId = ?",
                [userId, challengeId]
            );

            if (!task.length) {
                req.flash("error", errorMessages.NOT_HAVE_TASK);
                return
            }

            let currentPercentage = parseFloat(task[0].completionPercentage);
            let percentage = Math.min(100, (currentPercentage + parseFloat(progress)).toFixed(2));

            if (percentage >= 10) {
                const [account] = await connection.query("SELECT id, points FROM users WHERE id = ?", [userId]);
                const newPoints = parseInt(account[0].points) + parseInt(task[0].points);

                await connection.query("UPDATE users SET points = ?, updatedAt = NOW() WHERE id = ?", [newPoints, userId]);
                await connection.query("DELETE FROM challengesForUser WHERE userId = ? AND challengeId = ?", [userId, challengeId]);

                req.flash("success", "Desafio concluído! Tokens adicionados.");
                return next();
            }

            await connection.query("UPDATE challengesForUser SET completionPercentage = ?, updatedAt = NOW() WHERE userId = ? AND challengeId = ?", [percentage, userId, challengeId]);
            return // Sem resposta enviada, siga para o próximo middleware
        } catch (error) {
            console.log(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return next();
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
                return
            }

            let progressForTask = this.calculateProgress(challengeId);
            const updatedPercentage = Math.min(100, (parseFloat(task[0].completionPercentage) + parseFloat(progressForTask)).toFixed(2));

            await incrementPercentage(updatedPercentage, userId, challengeId);

            if (updatedPercentage >= 10) {
                return await this.updateChallengeProgress(req, res, next, userId, challengeId, 0); // Resposta gerida pela função chamada
            } else {
                return // Sem resposta enviada, siga para o próximo middleware
            }
        } catch (error) {
            console.log(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return next();
        }
    }

    static calculateProgress(challengeId) {
        switch (challengeId) {
            case 1:
                return 10 / 5;  // Ex: 5 novas pessoas
            case 2:
                return 10 / 4;  // Ex: 3 comentários
            case 3:
                return 10 / 10; // Ex: 10 compartilhamentos
            case 4:
                return 10 / 1;  // Ex: Tarefa especial
            case 5:
                return 10 / 1;  // Ex: Outro tipo de tarefa
            default:
                return 0;       // Desafio desconhecido
        }
    }
}

module.exports = ChallengeHelpers;