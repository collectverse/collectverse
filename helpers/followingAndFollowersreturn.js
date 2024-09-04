const connection = require("../schema/connection")

async function returnFollowersAndFollowing(id) {
    // consulta seguidores e seguindo

    const followers = await connection.query("SELECT followers FROM follows WHERE UserId = ?", [id]);
    const following = await connection.query("SELECT following FROM follows WHERE UserId = ?", [id]);

    let usersFromFollowers = JSON.parse(followers[0][0].followers || "[]");
    let usersFromFollowing = JSON.parse(following[0][0].following || "[]");

    let resultForFollowers = [];
    let resultForFollowing = [];

    if (usersFromFollowers.length > 0) {
        for (let i = 0; i < usersFromFollowers.length; i++) {
            const item = await connection.query("SELECT users.id, users.name, users.perfil, users.perfilBase64, follows.following, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [usersFromFollowers[i]]);
            resultForFollowers.push(item[0][0]);
        }
    }

    if (usersFromFollowing.length > 0) {
        for (let i = 0; i < usersFromFollowing.length; i++) {
            const item = await connection.query("SELECT users.id, users.name, users.perfil, users.perfilBase64, follows.following, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [usersFromFollowing[i]]);
            resultForFollowing.push(item[0][0]);
        }
    }

    return {resultForFollowers, resultForFollowing}
}

module.exports = returnFollowersAndFollowing